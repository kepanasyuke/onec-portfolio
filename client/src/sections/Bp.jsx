import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, filterBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading } from "../components/ui.jsx";
import { BarList } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { money, num } from "../format.js";
import { IconCheck, IconAlert } from "../icons.jsx";

const KEY = "bp";

const FILTERS = [
  { value: "all", label: "Все счета" },
  { value: "Активный", label: "Активные" },
  { value: "Пассивный", label: "Пассивные" },
];

const COLUMNS = [
  { key: "Code", title: "Счёт", sortable: true, render: (row) => <span className="mono">{row.Code}</span> },
  { key: "Name", title: "Наименование", sortable: true },
  { key: "Kind", title: "Вид", sortable: true, render: (row) => <Badge tone="neutral">{row.Kind}</Badge> },
  { key: "closingDt", title: "Сальдо Дт", align: "right", sortable: true, render: (row) => money(row.closingDt) },
  { key: "closingKt", title: "Сальдо Кт", align: "right", sortable: true, render: (row) => money(row.closingKt) },
  {
    key: "balance",
    title: "Итог",
    align: "right",
    sortable: true,
    render: (row) => <strong style={{ color: row.red ? "var(--danger)" : "inherit" }}>{money(row.balance)}</strong>,
  },
  {
    key: "red",
    title: "Проверка",
    align: "center",
    sortable: false,
    render: (row) => (row.red ? <Badge tone="danger">Красное сальдо</Badge> : <Badge tone="success">Норма</Badge>),
  },
];

const rowTone = (row) => (row.red ? "is-alert" : undefined);

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Code", "Name"])(filterBy(ui, "Kind")(rows)));

const chartItems = (rows) => rows.map((row) => ({ label: row.Code, value: row.TurnDt, tone: row.red ? "danger" : "brand" }));

const verdictText = (balanced, delta) =>
  balanced
    ? "Обороты сбалансированы: сумма Дт равна сумме Кт, расхождение 0 ₽."
    : `Расхождение оборотов: ${money(delta)}. Проверьте полноту выгрузки и ручные операции.`;

const redText = (red) => (red.length ? ` Красное сальдо на счетах: ${red.join(", ")}.` : " Красного сальдо не найдено.");

const Verdict = ({ balanced, delta, red }) => (
  <div className={`note ${balanced ? "note--info" : "note--danger"}`}>
    {balanced ? <IconCheck /> : <IconAlert />}
    <span>
      {verdictText(balanced, delta)}
      {redText(red)}
    </span>
  </div>
);

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Оборот Дт" value={money(data.totals.debit)} tone="brand" />
        <Stat label="Оборот Кт" value={money(data.totals.credit)} tone="brand" />
        <Stat label="Расхождение" value={money(data.delta)} tone={data.balanced ? "success" : "danger"} />
        <Stat label="Красное сальдо" value={num(data.red.length)} tone={data.red.length ? "danger" : "success"} note="счетов" />
      </div>

      <Card title="Обороты по счетам" subtitle="Дебетовый оборот по каждому счёту; красным выделены счета с красным сальдо">
        <BarList items={chartItems(data.rows)} format={money} />
      </Card>

      <Card title="Оборотно-сальдовая ведомость" subtitle="Сальдо конечное считается по правилу счёта: активный — по Дт, пассивный — по Кт">
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Оборотно-сальдовая ведомость"
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

      <Verdict balanced={data.balanced} delta={data.delta} red={data.red} />
    </>
  );
};

export const BpSection = () => {
  const { data, ui, error } = useView("/api/bp/osv", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="02"
        title="БП 3.0: оборотно-сальдовая ведомость без ручной сверки"
        lead="Загрузка выгрузки ОСВ и автоматические проверки: арифметика сальдо по каждому счёту, равенство оборотов Дт и Кт, поиск кредитового остатка на активных счетах — «красного сальдо» по кассе, складу и банку."
        stack={["БП 3.0", "ОСВ", "Счета 51, 60, 62", "Контроль сальдо"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
