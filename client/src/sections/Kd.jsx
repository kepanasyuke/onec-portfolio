import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading, Code } from "../components/ui.jsx";
import { BarList } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { num, percent } from "../format.js";

const KEY = "kd";

const TONE = { Готово: "success", Проверить: "warn", Доработка: "danger" };

const tone = (status) => TONE[status] || "neutral";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "Готово", label: "Готово" },
  { value: "Проверить", label: "Проверить" },
  { value: "Доработка", label: "Доработка" },
];

const COLUMNS = [
  { key: "Code", title: "Правило", sortable: true, render: (row) => <span className="mono">{row.Code}</span> },
  { key: "Source", title: "Источник", sortable: true },
  { key: "Target", title: "Приёмник", sortable: true },
  { key: "Objects", title: "Объектов", align: "right", sortable: true, render: (row) => num(row.Objects) },
  { key: "Issues", title: "Ошибок", align: "right", sortable: true, render: (row) => <Badge tone={row.Issues ? "warn" : "success"}>{num(row.Issues)}</Badge> },
  { key: "quality", title: "Качество", align: "right", sortable: true, render: (row) => percent(row.quality) },
  { key: "status", title: "Статус", sortable: true, render: (row) => <Badge tone={tone(row.status)}>{row.status}</Badge> },
];

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Code", "Source", "Target"])(rows));

const chartItems = (rows) => rows.map((row) => ({ label: row.Code, value: row.quality, tone: row.Issues ? "warn" : "success" }));

const Mapping = ({ rule }) => (
  <dl className="kv">
    {rule.map.map((pair) => (
      <div key={pair[0]} style={{ display: "contents" }}>
        <dt>{pair[0]}</dt>
        <dd>→ {pair[1]}</dd>
      </div>
    ))}
  </dl>
);

const StatusFilter = (ui) => (rows) => (ui.filter === "all" ? rows : rows.filter((row) => row.status === ui.filter));

const ruleOf = (rows, fallback) => rows[0] || fallback;

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(StatusFilter(ui)(data.rows));
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Правил конвертации" value={num(data.rows.length)} />
        <Stat label="Объектов к переносу" value={num(data.objects)} tone="brand" />
        <Stat label="Ошибок соответствия" value={num(data.issues)} tone={data.issues ? "warn" : "success"} />
        <Stat
          label="Среднее качество"
          value={percent(data.rows.reduce((sum, item) => sum + item.quality, 0) / data.rows.length)}
          tone="success"
        />
      </div>

      <Card title="Качество правил обмена" subtitle="Доля объектов без ошибок соответствия реквизитов">
        <BarList items={chartItems(data.rows)} format={percent} tone="success" />
      </Card>

      <Card title="Правила обмена УТ → БП" subtitle="Клик по заголовку сортирует таблицу">
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Правила обмена"
          columns={COLUMNS}
          rows={rows}
          hint={`Показано ${rows.length} из ${data.rows.length}`}
        />
        <DataTable
          columns={COLUMNS}
          rows={rows}
          sort={ui.sort}
          dir={ui.dir}
          onSort={(key) => patchValue(KEY)(toggleSort(key, ui))}
          empty="Под фильтр ничего не попало"
        />
      </Card>

      <div className="split">
        <Card
          title={`Карта соответствия ${ruleOf(rows, data.rows[0]).Code}`}
          subtitle={`${ruleOf(rows, data.rows[0]).Source} → ${ruleOf(rows, data.rows[0]).Target}`}
        >
          <Mapping rule={ruleOf(rows, data.rows[0])} />
        </Card>
        <Card title="Результат конвертации" subtitle="Фрагмент XML, который уходит в приёмник">
          <Code caption="XML">{data.sample}</Code>
        </Card>
      </div>
    </>
  );
};

export const KdSection = () => {
  const { data, ui, error } = useView("/api/kd/exchange", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="05"
        title="КД 3.1: правила конвертации между УТ и БП"
        lead="Карта соответствия реквизитов, контроль качества правил обмена и генерация XML на выходе. Раздел отвечает требованию вакансии по КД и разработке нетиповых обменов между базами."
        stack={["КД 3.1", "Конвертация данных", "Соответствие реквизитов", "XML"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
