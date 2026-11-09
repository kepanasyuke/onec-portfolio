import { NAV } from "../nav.js";

export const LeftPanel = ({ active }) => (
  <aside className="leftnav">
    <div>
      <div className="leftnav__title">Панель навигации</div>
      <ul className="leftnav__list">
        {NAV.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={`leftnav__item${active === item.id ? " is-active" : ""}`} aria-current={active === item.id ? "page" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <div className="leftnav__title">Действия</div>
      <div className="leftnav__actions">
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Обновить
        </button>
        <button type="button" className="btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Наверх
        </button>
      </div>
    </div>
    <div className="leftnav__foot">
      Стек: УТ · БП · ЗУП · ДО · КД
      <br />
      MS SQL · PostgreSQL · XML/SOAP
    </div>
  </aside>
);
