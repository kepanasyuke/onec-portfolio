import { NAV } from "../nav.js";

export const Tabs = ({ active }) => (
  <nav className="tabs">
    {NAV.map((item) => (
      <a key={item.id} href={`#${item.id}`} className={`tab${active === item.id ? " is-active" : ""}`} aria-current={active === item.id ? "page" : undefined}>
        <item.icon />
        <span>{item.tab}</span>
      </a>
    ))}
  </nav>
);
