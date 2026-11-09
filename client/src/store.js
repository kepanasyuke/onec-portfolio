const cache = new Map();

const listeners = new Set();

const PENDING = { data: null, loading: true, error: null };

const notify = (listener) => listener();

const refresh = () => listeners.forEach(notify);

const readJson = (response) => response.json();

const storeData = (path) => (data) => {
  cache.set(path, { data, loading: false, error: null });
  refresh();
};

const storeError = (path) => (error) => {
  cache.set(path, { data: null, loading: false, error: error.message });
  refresh();
};

const load = (path) => fetch(path).then(readJson).then(storeData(path)).catch(storeError(path));

const requested = new Set();

const start = (path) => {
  requested.add(path);
  return cache.has(path) || load(path);
};

const dropListener = (listener) => () => listeners.delete(listener);

const enroll = (path) => (listener) => {
  start(path);
  return dropListener(listener);
};

const subscribe = (path) => (listener) => {
  listeners.add(listener);
  return enroll(path)(listener);
};

const bindings = new Map();

const cached = (path, factory) => {
  bindings.has(path) || bindings.set(path, factory(path));
  return bindings.get(path);
};

export const subscribeTo = (path) => cached(`s:${path}`, () => subscribe(path));

export const snapshotOf = (path) => cached(`v:${path}`, () => () => cache.get(path) || PENDING);

const reload = (path) => load(path);

export const invalidateAll = () => {
  cache.clear();
  requested.forEach(reload);
};
