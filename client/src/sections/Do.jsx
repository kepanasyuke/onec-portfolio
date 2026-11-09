import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, filterBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading, Meter } from "../components/ui.jsx";
import { Columns } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { num } from "../format.js";
import { IconAlert, IconCheck } from "../icons.jsx";

const KEY = "do";

const STATUS_TONE = { "На согласовании": "brand", Согласован: "success", Отклонён: "danger", Черновик: "neutral" };

const tone = (status) => STATUS_TONE[status] || "neutral";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "На согласовании", label: "На согласовании" },
  { value: "Согласован", label: "Согласован" },
  { value: "Отклонён", label: "Отклонён" },
  { value: "Черновик", label: "Черновик" },
];

const COLUMNS = [
  { key: "Number", title: "Документ", sortable: true, render: (row) => <span className="mono">{row.Number}</span> },
  { key: "Title", title: "Название", sortable: true },
  { key: "Author", title: "Автор", sortable: true },
  { key: "Status", title: "Статус", sortable: true, render: (row) => <Badge tone={tone(row.Status)}>{row.Status}</Badge> },
  { key: "Step", title: "Текущий шаг", sortable: true },
  { key: "Hours", title: "В работе, ч", align: "right", sortable: true, render: (row) => num(row.Hours) },
  {
    key: "norm",
    title: "SLA",
    sortable: false,
    render: (row) => <Meter value={row.Hours} max={row.norm} tone={row.overdue ? "danger" : "success"} />,
  },
  {
    key: "overdue",
    title: "Контроль",
    align: "center",
    sortable: true,
    render: (row) => (row.overdue ? <Badge tone="danger">Просрочен</Badge> : <Badge tone="success">В норме</Badge>),
  },
];

const rowTone = (row) => (row.overdue ? "is-alert" : undefined);

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Number", "Title", "Author"])(filterBy(ui, "Status")(rows)));

const chartItems = (rows) =>
  rows.map((row) => ({ label: row.Number.replace("ДО-", ""), value: row.Hours, tone: row.overdue ? "danger" : "success" }));

const verdictText = (overdue) =>
  overdue
    ? `Просрочено документов: ${overdue}. Нормативы по шагам: юридический отдел — 24 ч, финансовый — 48 ч, снабжение — 8 ч.`
    : "Все активные документы укладываются в норматив по шагам маршрута.";

const Verdict = ({ overdue }) => (
  <div className={`note ${overdue ? "note--danger" : "note--info"}`}>
    {overdue ? <IconAlert /> : <IconCheck />}
    <span>{verdictText(overdue)}</span>
  </div>
);

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Всего документов" value={num(data.rows.length)} />
        <Stat label="На согласовании" value={num(data.active)} tone="brand" note="активные маршруты" />
        <Stat label="Просрочено" value={num(data.overdue)} tone={data.overdue ? "danger" : "success"} note="выход за SLA" />
        <Stat label="Суммарно в работе" value={`${num(data.totalHours)} ч`} note="по всем документам" />
      </div>

      <Card title="Время в работе по документам" subtitle="Красные столбцы — выход за норматив шага">
        <Columns items={chartItems(data.rows)} format={(value) => `${value} ч`} />
      </Card>

      <Card title="Документы и маршруты согласования" subtitle="SLA задаётся по шагу маршрута; просрочка подсвечивается автоматически">
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Документы и маршруты"
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

      <Verdict overdue={data.overdue} />
    </>
  );
};

export const DoSection = () => {
  const { data, ui, error } = useView("/api/do/documents", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="04"
        title="ДО 3.0: маршруты согласования и контроль SLA"
        lead="Электронный документооборот компании: карточка документа, текущий шаг маршрута, норматив на шаг и признак просрочки. Раздел закрывает обязанность консультационно-информационной поддержки пользователей на конфигурации ДО."
        stack={["ДО 3.0", "Маршруты", "SLA по шагам", "Статусы"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
