import { useApi } from "../hooks.js";
import { Button } from "./ui.jsx";
import { IconRefresh, IconLink, IconPrint } from "../icons.jsx";
import { refreshData, copyLink, printPage } from "../actions.js";

const Brand = () => (
  <div className="brand">
    <span className="brand__mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="30" height="30">
        <rect width="32" height="32" rx="5" fill="#FFC000" />
        <rect x="0.5" y="0.5" width="31" height="31" rx="4.5" fill="none" stroke="#E0A800" />
        <text
          x="16"
          y="21.5"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#1a1a1a"
          fontFamily="Segoe UI, Arial, sans-serif"
        >
          1С
        </text>
      </svg>
    </span>
    <div className="brand__text">
      <div className="brand__title">Портфолио программиста 1С</div>
      <div className="brand__sub">Восемь проектов под стек вакансии</div>
    </div>
  </div>
);

export const TopBar = () => {
  const { error } = useApi("/api/health");
  return (
    <header className="topbar">
      <Brand />
      <div className="topbar__right">
        <div className="topbar__actions">
          <Button icon={IconRefresh} size="sm" onClick={refreshData} title="Обновить данные во всех разделах">
            Обновить
          </Button>
          <Button icon={IconLink} size="sm" onClick={copyLink} title="Скопировать ссылку на текущий раздел">
            Ссылка
          </Button>
          <Button icon={IconPrint} size="sm" onClick={printPage} title="Печать текущего раздела">
            Печать
          </Button>
        </div>
        <span className={error ? "pill pill--off" : "pill pill--on"} role="status">
          {error ? "API офлайн" : "API онлайн"}
        </span>
        <span className="topbar__ver">1С:Предприятие 8.3</span>
      </div>
    </header>
  );
};
