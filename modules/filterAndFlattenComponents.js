function eachComponents(components, iterator) {
  for (let i = 0, l = components.length; i < l; i++) {
    if (typeof components[i] === 'object') {
      for (let key in components[i]) {
        iterator(components[i][key], i, key);
      }
    } else {
      iterator(components[i], i);
    }
  }
}

export default function filterAndFlattenComponents(components) {
  const flattened = [];
  eachComponents(components, (Component) => {
    if (Component && Component.loadData) {
      flattened.push(Component);
    }
  });
  return flattened;
}
