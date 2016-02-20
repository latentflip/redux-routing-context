export default function shallowEqual(a, b) {
  let key;
  let ka = 0;
  let kb = 0;

  for (key in a) {
    if (a.hasOwnProperty(key) && a[key] !== b[key]) {
      return false;
    }
    ka++;
  }

  for (key in b) {
    if (b.hasOwnProperty(key)) {
      kb++;
    }
  }

  return ka === kb;
}
