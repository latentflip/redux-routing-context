export default function arrayDiff(previous, next) {
  const diff = [];

  for (let i = 0, l = next.length; i < l; i++) {
    if (previous.indexOf(next[i]) === -1) {
      diff.push(next[i]);
    }
  }

  return diff;
}
