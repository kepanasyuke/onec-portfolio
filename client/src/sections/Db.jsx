import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading, Meter } from "../components/ui.jsx";
import { BarList } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { ms, num } from "../format.js";

const KEY = "db";

const FILTERS = [
  { value: "all", label: "Все запросы" },
  { value: "slow", label: "Медленные" },
  { value: "index", label: "Без индекса" },
];

const COLUMNS = [
  { key: "Caption", title: "Запрос", sortable: true },
  { key: "Table", title: "Таблица", sortable: true, render: (row) => <span className="mono">{row.Table}</span> },
  {
    key: "ExecMs",
    title: "Время",
    align: "right",
    sortable: true,
    render: (row) => <strong style={{ color: row.slow ? "var(--danger)" : "inherit" }}>{ms(row.ExecMs)}</strong>,
  },
  { key: "Rows", title: "Строк", align: "right", sortable: true, render: (row) => num(row.Rows) },
  {
    key: "IndexUsed",
    title: "Индекс",
    align: "center",
    sortable: true,
    render: (row) => (row.IndexUsed ? <Badge tone="success">Есть</Badge> : <Badge tone="warn">Нет</Badge>),
  },
  { key: "load", title: "Нагрузка", sortable: false, render: (row) => <Meter value={row.ExecMs} max={2400} tone={row.slow ? "danger" : "success"} /> },
  { key: "advice", title: "Рекомендация", sortable: false, render: (row) => <span className="muted">{row.advice}</span> },
];

const rowTone = (row) => (row.needsIndex ? "is-warn" : undefined);

const MODES = { slow: (row) => row.slow, index: (row) => row.needsIndex };

const byMode = (mode) => (rows) => (MODES[mode] ? rows.filter(MODES[mode]) : rows);

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Caption", "Table"])(byMode(ui.filter)(rows)));

const chartItems = (rows) => rows.map((row) => ({ label: row.Table, value: row.ExecMs, tone: row.slow ? "danger" : "success" }));

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Запросов в профиле" value={num(data.total)} />
        <Stat label="Медленных" value={num(data.slow)} tone={data.slow ? "danger" : "success"} note="дольше 500 мс" />
        <Stat label="Кандидатов на индекс" value={num(data.indexCandidates)} tone="warn" note="сканирование таблицы" />
        <Stat label="Суммарное время" value={ms(data.totalMs)} tone="brand" />
      </div>

      <Card title="Время выполнения" subtitle="Сортировка по времени — самые тяжёлые запросы слева">
        <BarList items={chartItems(data.rows)} format={ms} tone="danger" />
      </Card>

      <Card title="Профиль производительности" subtitle="Признак «Нет» в колонке «Индекс» — сканирование таблицы">
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Профиль запросов"
          columns={COLUMNS}
          rows={rows}
          hint={`Показано ${rows.length} из ${data.rows.length}`}
        />
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowClass={rowTone}
          sort={ui.sort}
          dir={ui.dir}
          onSort={(key) => patchValue(KEY)(toggleSort(key, ui))}
          empty="Под фильтр ничего не попало"
        />
      </Card>

      <div className="note note--info">
        <span>
          Для запросов без индекса рекомендация — составной индекс по измерению и периоду. На MS SQL проверяется через
          sys.dm_db_missing_index_details, на PostgreSQL — pg_stat_user_tables и EXPLAIN (ANALYZE, BUFFERS).
        </span>
      </div>
    </>
  );
};

export const DbSection = () => {
  const { data, ui, error } = useView("/api/db/metrics", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="08"
        title="MS SQL и PostgreSQL: производительность запросов 1С"
        lead="Профиль запросов с признаком использования индекса, сортировкой по времени и рекомендациями. Закрывает пункт вакансии по работе с MS SQL и PostgreSQL: платформы, запросы, внешние источники."
        stack={["MS SQL", "PostgreSQL", "Планы запросов", "Индексы"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
