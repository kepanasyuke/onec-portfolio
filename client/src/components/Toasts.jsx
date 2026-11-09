import { useUi } from "../hooks.js";
import { IconCheck, IconAlert } from "../icons.jsx";

const toastIcon = (tone) => (tone === "success" ? <IconCheck /> : <IconAlert />);

export const Toasts = () => {
  const toasts = useUi("toasts", []);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          {toastIcon(toast.tone)}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
