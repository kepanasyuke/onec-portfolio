import { useSyncExternalStore } from "react";
import { subscribeTo, snapshotOf } from "./store.js";
import { subscribeKey, snapshotKey } from "./state.js";

export const useApi = (path) => useSyncExternalStore(subscribeTo(path), snapshotOf(path));

export const useUi = (key, initial) => useSyncExternalStore(subscribeKey(key), snapshotKey(key, initial));

export const useView = (path, key, initial) => Object.assign({}, useApi(path), { ui: useUi(key, initial) });

const currentHash = () => window.location.hash.replace("#", "") || "overview";

const subscribeHash = (listener) => {
  window.addEventListener("hashchange", listener);
  return unobserve(listener);
};

const unobserve = (listener) => () => window.removeEventListener("hashchange", listener);

export const useRoute = () => useSyncExternalStore(subscribeHash, currentHash);
