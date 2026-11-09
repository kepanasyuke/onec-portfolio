import { readValue, writeValue } from "./state.js";

const DURATION = 2800;

const push = (toast) => writeValue("toasts")(readValue("toasts", []).concat(toast));

const dismiss = (id) => writeValue("toasts")(readValue("toasts", []).filter((item) => item.id !== id));

const scheduleDrop = (id) => setTimeout(() => dismiss(id), DURATION);

const withSchedule = (toast) => {
  push(toast);
  return scheduleDrop(toast.id);
};

const nextId = () => `${Date.now()}_${Math.random()}`;

export const notify = (text, tone = "info") => withSchedule({ id: nextId(), text, tone });
