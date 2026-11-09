import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, filterBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading } from "../components/ui.jsx";
import { BarList } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { money } from "../format.js";

const KEY = "zup";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "Производство", label: "Производство" },
  { value: "Финансы", label: "Финансы" },
  { value: "Снабжение", label: "Снабжение" },
  { value: "Бухгалтерия", label: "Бухгалтерия" },
];

const COLUMNS = [
  { key: "Tab", title: "Таб. №", sortable: true, render: (row) => <span className="mono">{row.Tab}</span> },
  { key: "FullName", title: "Сотрудник", sortable: true },
  { key: "Position", title: "Должность", sortable: true },
  { key: "Department", title: "Подразделение", sortable: true },
  { key: "Salary", title: "Оклад", align: "right", sortable: true, render: (row) => money(row.Salary) },
  {
    key: "KpiPercent",
    title: "KPI",
    align: "right",
    sortable: true,
    render: (row) => <Badge tone={row.KpiPercent >= 100 ? "success" : "warn"}>{`${row.KpiPercent} %`}</Badge>,
  },
  { key: "premium", title: "Премия", align: "right", sortable: true, render: (row) => money(row.premium) },
  { key: "gross", title: "Начислено", align: "right", sortable: true, render: (row) => money(row.gross) },
  { key: "ndfl", title: "НДФЛ", align: "right", sortable: true, render: (row) => money(row.ndfl) },
  { key: "net", title: "На руки", align: "right", sortable: true, render: (row) => <strong>{money(row.net)}</strong> },
  { key: "contributions", title: "Взносы", align: "right", sortable: true, render: (row) => money(row.contributions) },
];

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["FullName", "Position", "Tab"])(filterBy(ui, "Department")(rows)));

const chartItems = (rows) => rows.map((row) => ({ label: row.FullName.split(" ")[0], value: row.gross }));

const averageNet = (rows) => money(rows.reduce((sum, row) => sum + row.net, 0) / Math.max(rows.length, 1));

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Фонд начислений" value={money(data.fund)} tone="brand" note="с премиями по KPI" />
        <Stat label="НДФЛ" value={money(data.tax)} note="прогрессивная шкала 2026" />
        <Stat label="Страховые взносы" value={money(data.contributions)} tone="warn" note="с предельной базой" />
        <Stat label="Средняя на руки" value={averageNet(data.rows)} tone="success" />
      </div>

      <Card title="Начисления по сотрудникам" subtitle="Начислено = оклад + премия по KPI">
        <BarList items={chartItems(data.rows)} format={money} tone="success" />
      </Card>

      <Card
        title="Расчёт зарплаты за ноябрь 2026"
        subtitle="НДФЛ и взносы считаются от годовой базы с разбивкой по ставкам. Клик по заголовку сортирует таблицу"
      >
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Расчёт зарплаты"
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
    </>
  );
};

export const ZupSection = () => {
  const { data, ui, error } = useView("/api/zup/payroll", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="03"
        title="ЗУП 3.1: премии по KPI, НДФЛ и страховые взносы"
        lead="Расчёт начислений по сотрудникам: премия от выполнения KPI, прогрессивный НДФЛ с разделением годовой базы по ставкам 13–22 % и страховые взносы с предельной базой. Ровно та часть ЗУП, которую чаще всего дорабатывают под регламент компании."
        stack={["ЗУП 3.1", "НДФЛ 13–22 %", "Единый тариф 30 %", "Предельная база"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
