const values = new Map();

const listeners = new Set();

const bindings = new Map();

const notify = (listener) => listener();

const refresh = () => listeners.forEach(notify);

const unobserve = (listener) => () => listeners.delete(listener);

const subscribe = (listener) => {
  listeners.add(listener);
  return unobserve(listener);
};

const cached = (key, factory) => {
  bindings.has(key) || bindings.set(key, factory(key));
  return bindings.get(key);
};

export const readValue = (key, initial) => (values.has(key) ? values.get(key) : initial);

export const writeValue = (key) => (value) => {
  values.set(key, value);
  refresh();
};

export const patchValue = (key) => (patch) => writeValue(key)(Object.assign({}, readValue(key, {}), patch));

export const subscribeKey = (key) => cached(`s:${key}`, () => subscribe);

export const snapshotKey = (key, initial) => cached(`v:${key}`, () => () => readValue(key, initial));
