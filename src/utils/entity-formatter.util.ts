import { ulid } from 'ulid';

export const entityFormatter = <T>(
  arr: T[],
  prefix: string,
  newProperty?: object
) => {
  let formatResult = [];
  const ids = [];

  formatResult = arr.map((item) => {
    const newItem = {};
    Object.keys(item).forEach((key) => {
      let newKey = key;
      if (key.startsWith(prefix)) {
        newKey = key.substring(1);
      }
      if (Array.isArray(item[key])) {
        const data = entityFormatter(
          item[key],
          prefix,
          newProperty
        ).formatResult;
        delete newItem[key];
        newItem[newKey] = data;
      } else {
        if (!key.startsWith(prefix)) {
          newItem[key] = item[key];
        } else {
          newItem[newKey] = item[key];
        }
        if (key === 'timerId') {
          ids.push(newItem[newKey]);
        }
      }
    });
    // eslint-disable-next-line prefer-const
    for (let [k, v] of Object.entries(newProperty)) {
      if (v === 'ulid') {
        v = ulid();
      }
      newItem[k] = v;
    }
    return newItem;
  });
  return { formatResult, ids };
};
