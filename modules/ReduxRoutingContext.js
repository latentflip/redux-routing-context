import React from 'react';
import { RouterContext } from 'react-router';

import last from './last';
import arrayDiff from './arrayDiff';
import shallowEqual from './shallowEqual';
import filterAndFlattenComponents from './filterAndFlattenComponents';

function loadAsyncProps(dispatch, components, params, location) {
  return Promise.all(
    components.map((Component) => Component.loadData(dispatch, params, location))
  );
}

function createLoadingElement(Component, props) {
  if (!Component.loadData) {
    return <Component {...props} />
  }

  if (Component.renderLoading) {
    return Component.renderLoading(props);
  }

  return null;
}

class ReduxRoutingContext extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.store = context.store;
    this.state = {
      // are we currently loading
      loading: false,
      // is this the very first load, or have we changed params?
      loadedOnce: false,
      // previous props to render with while changing params
      prevProps: null
    };
  }

  componentDidMount() {
    const { components, params, location } = this.props;
    this.loadAsyncProps(components, params, location);
  }

  componentWillReceiveProps(nextProps) {
    // for now we'll just reload everything
    this.loadAsyncProps(filterAndFlattenComponents(nextProps.components), nextProps.params, nextProps.location);
  }

  loadAsyncProps(components, params, location, options) {
    this.setState({
      loading: true,
      prevProps: this.props
    });

    loadAsyncProps(
      this.store.dispatch,
      filterAndFlattenComponents(components),
      params,
      location
    ).then(
      (v) => {
        this.setState({ loading: false, loadedOnce: true, prevProps: null });
      },
      (err) => {
        this.setState({ loading: false, error: err, prevProps: null });
      }
    );
  }

  renderLoading() {
    return null;
  }

  render() {
    const props = this.state.loading ? this.state.prevProps : this.props;
    const extraProps = {
      loading: this.state.loading
    };

    if (!this.state.loadedOnce) {
      return (<RouterContext {...props} {...extraProps} createElement={createLoadingElement}/>);
    }

    return (<RouterContext {...props} {...extraProps} />);
  }
}

ReduxRoutingContext.contextTypes = {
  store: React.PropTypes.object
};

export default ReduxRoutingContext;
