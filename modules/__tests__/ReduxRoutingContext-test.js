import 'babel-polyfill';
import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router';
import createHistory from 'react-router/lib/createMemoryHistory'
import expect, { spyOn, restoreSpies } from 'expect';

import ReduxRoutingContext from '../ReduxRoutingContext';

const iterate = (...args) => {
  let it = 0;
  return () => {
    const result = args[it];
    it++;
    return result;
  };
};

const store = {
  dispatch: function () {}
};

const mountWithStoreContext = (component) => {
  return mount(component, {
    context: { store: store },
    childContextTypes: { store: React.PropTypes.object }
  });
};

const defer = (fn) => setTimeout(fn, 0);

const asyncSteps = (...steps) => {
  setTimeout(() => {
    if (steps.length === 0) return;
    steps[0]();
    asyncSteps(...steps.slice(1));
  }, 0);
};


const resolvablePromise = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

const getRoutes = () => {

  const App = (props) => (<div className='App' {...props} />);
  const Page = (props) => (<div className='Page' {...props} />);
  const Sub = (props) => (<div className='Sub' {...props} />);

  const routes = (
    <Route path='/' component={App}>
      <Route path='page/:pageId' component={Page}>
      <Route path='sub/:subId' component={Sub} />
      </Route>
    </Route>
  );

  return { App, Page, Sub, routes };
}

describe('ReduxRoutingContext', () => {

  afterEach(() => restoreSpies());

  describe('rendering', () => {
    it('should render', (done) => {
      const { App, Page, Sub, routes } = getRoutes();

      const dom = mountWithStoreContext(
        <Router
          routes={routes}
          history={createHistory('/page/1/sub/1')}
          render={(props) => (<ReduxRoutingContext {...props} />)}
        />
      );

      expect(dom.find('.App').get(0)).toExist('Rendered app');
      expect(dom.find('.Page').get(0)).toExist('Rendered page');
      expect(dom.find('.Sub').get(0)).toExist('Rendered sub');
      done();
    });

    it('should defer render if promise not resolved', (done) => {
      const { App, Page, Sub, routes } = getRoutes();

      let appData = resolvablePromise();
      let pageData = resolvablePromise();
      let subData = resolvablePromise();

      App.loadData = () => appData;
      Page.loadData = () => pageData;
      Sub.loadData = () => subData;

      const appDataSpy = spyOn(App, 'loadData').andCallThrough();
      const pageDataSpy = spyOn(Page, 'loadData').andCallThrough();
      const subDataSpy = spyOn(Sub, 'loadData').andCallThrough();

      const history = createHistory('/page/1/sub/1');
      const dom = mountWithStoreContext(
        <Router
          routes={routes}
          history={history}
          render={(props) => (<ReduxRoutingContext {...props} />)}
        />
      );

      asyncSteps(
        () => {
          expect(dom.find('.App').get(0)).toNotExist('No app before resolve');
          expect(dom.find('.Page').get(0)).toNotExist('No page before resolve');
          expect(dom.find('.Sub').get(0)).toNotExist('No sub before resolve');

          expect(appDataSpy.calls.length).toEqual(1);
          expect(pageDataSpy.calls.length).toEqual(1);
          expect(subDataSpy.calls.length).toEqual(1);

          expect(appDataSpy).toHaveBeenCalledWith(
            store.dispatch,
            { pageId: '1', subId: '1' },
            dom.state('location')
          );
          expect(pageDataSpy).toHaveBeenCalledWith(
            store.dispatch,
            { pageId: '1', subId: '1' },
            dom.state('location')
          );
          expect(subDataSpy).toHaveBeenCalledWith(
            store.dispatch,
            { pageId: '1', subId: '1' },
            dom.state('location')
          );
        },
        () => appData.resolve(),
        () => {
          expect(dom.find('.App').get(0)).toNotExist('No app after resolve 1');
          expect(dom.find('.Page').get(0)).toNotExist('No page after resolve 1');
          expect(dom.find('.Sub').get(0)).toNotExist('No sub after resolve 1');
        },
        () => {
          pageData.resolve();
          subData.resolve();
        },
        () => {
          expect(dom.find('.App').get(0)).toExist('App after resolve all');
          expect(dom.find('.Page').get(0)).toExist('Page after resolve all');
          expect(dom.find('.Sub').get(0)).toExist('Sub after resolve all');

          expect(appDataSpy.calls.length).toEqual(1);
          expect(pageDataSpy.calls.length).toEqual(1);
          expect(subDataSpy.calls.length).toEqual(1);
        },
        done
      );
    });

    it('should fetch new props on param changes', (done) => {
      const { App, Page, Sub, routes } = getRoutes();

      let appData = resolvablePromise();
      let pageData = resolvablePromise();
      let subData = resolvablePromise();

      let appData2 = resolvablePromise();
      let pageData2 = resolvablePromise();
      let subData2 = resolvablePromise();

      App.loadData = iterate(appData, appData2);
      Page.loadData = iterate(pageData, pageData2);
      Sub.loadData = iterate(subData, subData2);

      const appDataSpy = spyOn(App, 'loadData').andCallThrough();
      const pageDataSpy = spyOn(Page, 'loadData').andCallThrough();
      const subDataSpy = spyOn(Sub, 'loadData').andCallThrough();

      const history = createHistory('/page/1/sub/1');
      const dom = mountWithStoreContext(
        <Router
          routes={routes}
          history={history}
          render={(props) => (<ReduxRoutingContext {...props} />)}
        />
      );

      asyncSteps(
        () => {
          expect(dom.find('.App').get(0)).toNotExist('No app before resolve');
          expect(dom.find('.Page').get(0)).toNotExist('No page before resolve');
          expect(dom.find('.Sub').get(0)).toNotExist('No sub before resolve');

          expect(appDataSpy.calls.length).toEqual(1);
          expect(pageDataSpy.calls.length).toEqual(1);
          expect(subDataSpy.calls.length).toEqual(1);

          expect(appDataSpy.calls[0].arguments[1]).toEqual({ pageId: '1', subId: '1' });
          expect(pageDataSpy.calls[0].arguments[1]).toEqual({ pageId: '1', subId: '1' });
          expect(subDataSpy.calls[0].arguments[1]).toEqual({ pageId: '1', subId: '1' });
        },
        () => {
          appData.resolve();
          pageData.resolve();
          subData.resolve();
        },
        () => history.pushState(null, '/page/1/sub/2'),
        () => {
          expect(appDataSpy.calls.length).toEqual(2);
          expect(pageDataSpy.calls.length).toEqual(2);
          expect(subDataSpy.calls.length).toEqual(2);

          expect(appDataSpy.calls[1].arguments[1]).toEqual({ pageId: '1', subId: '2' });
          expect(pageDataSpy.calls[1].arguments[1]).toEqual({ pageId: '1', subId: '2' });
          expect(subDataSpy.calls[1].arguments[1]).toEqual({ pageId: '1', subId: '2' });
        },
        done
      );
    });

  });
});
