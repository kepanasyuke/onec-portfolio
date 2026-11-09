import { IconSearch, IconRefresh, IconDownload, IconReset } from "../icons.jsx";
import { Button } from "./ui.jsx";
import { downloadCsv, refreshData } from "../actions.js";

const Chip = ({ filter, active, onFilter }) => (
  <button
    type="button"
    className={`chip-btn${active === filter.value ? " is-active" : ""}`}
    onClick={() => onFilter(filter.value)}
  >
    {filter.label}
  </button>
);

export const Toolbar = ({ query, onQuery, filters, active, onFilter, onReset, exportName, columns, rows, hint }) => (
  <div className="toolbar">
    <label className="search" role="search">
      <IconSearch />
      <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Поиск по таблице" />
    </label>
    <div className="chips">
      {filters.map((filter) => (
        <Chip key={filter.value} filter={filter} active={active} onFilter={onFilter} />
      ))}
    </div>
    {hint ? <span className="toolbar__hint">{hint}</span> : null}
    <div className="toolbar__actions">
      <Button icon={IconRefresh} onClick={refreshData} title="Запросить данные с сервера заново">
        Обновить
      </Button>
      <Button icon={IconDownload} onClick={() => downloadCsv(exportName)(columns, rows)} title="Выгрузить текущую выборку в CSV">
        CSV
      </Button>
      <Button
        icon={IconReset}
        variant="ghost"
        disabled={!query && active === "all"}
        onClick={onReset}
        title="Сбросить поиск и фильтры"
      >
        Сброс
      </Button>
    </div>
  </div>
);
