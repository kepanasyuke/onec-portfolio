import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, filterBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading } from "../components/ui.jsx";
import { BarList } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { money, num } from "../format.js";

const KEY = "ut";

const STATUS_TONE = { "К обеспечению": "warn", "В работе": "brand", Отгружен: "success" };

const tone = (status) => STATUS_TONE[status] || "neutral";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "К обеспечению", label: "К обеспечению" },
  { value: "В работе", label: "В работе" },
  { value: "Отгружен", label: "Отгружен" },
];

const COLUMNS = [
  { key: "Number", title: "Заказ", sortable: true, render: (row) => <span className="mono">{row.Number}</span> },
  { key: "Client", title: "Клиент", sortable: true },
  { key: "Warehouse", title: "Склад", sortable: true },
  { key: "Status", title: "Статус", sortable: true, render: (row) => <Badge tone={tone(row.Status)}>{row.Status}</Badge> },
  { key: "total", title: "Сумма", align: "right", sortable: true, render: (row) => money(row.total) },
  { key: "lines", title: "Позиций", align: "right", sortable: false, render: (row) => num(row.lines.length) },
];

const PROBLEM_COLUMNS = [
  { key: "order", title: "Заказ", sortable: true, render: (row) => <span className="mono">{row.order}</span> },
  { key: "Nomenclature", title: "Номенклатура", sortable: true },
  { key: "Qty", title: "Требуется", align: "right", sortable: true, render: (row) => num(row.Qty) },
  { key: "missing", title: "Не хватает", align: "right", sortable: true, render: (row) => <Badge tone="danger">{num(row.missing)}</Badge> },
];

const rowTone = (row) => (row.Status === "К обеспечению" ? "is-warn" : undefined);

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Number", "Client", "Warehouse"])(filterBy(ui, "Status")(rows)));

const chartItems = (orders) => orders.map((order) => ({ label: order.Number, value: order.total, tone: order.Status === "Отгружен" ? "success" : "brand" }));

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Заказов" value={num(data.count)} note="выборка из регистра" />
        <Stat label="Сумма заказов" value={money(data.amount)} tone="brand" note="по строкам документа" />
        <Stat label="Строк в заказах" value={num(data.rows.reduce((sum, row) => sum + row.lines.length, 0))} note="табличные части" />
        <Stat
          label="Позиций с дефицитом"
          value={num(data.problems.length)}
          tone={data.problems.length ? "danger" : "success"}
          note="не покрыты остатком склада"
        />
      </div>

      <Card title="Суммы по заказам" subtitle="Сравнение заказов по рассчитанной сумме строк">
        <BarList items={chartItems(data.rows)} format={money} />
      </Card>

      <Card
        title="Заказы покупателей"
        subtitle="Типовой документ УТ с доработанным контролем обеспечения. Клик по заголовку сортирует таблицу"
      >
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Заказы покупателей"
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

      <Card title="Дефицит покрытия" subtitle="Строки заказов, которые не закрываются остатком по складу заказа">
        <DataTable columns={PROBLEM_COLUMNS} rows={data.problems} empty="Все заказы полностью обеспечены" />
      </Card>
    </>
  );
};

export const UtSection = () => {
  const { data, ui, error } = useView("/api/ut/orders", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="01"
        title="УТ 11.5: заказы покупателей и контроль обеспечения"
        lead="Разбор заказа на управляемых формах: расчёт суммы по строкам, сверка с реквизитом документа и поиск позиций, которые не закрываются остатком. Задача из вакансии — поддержка нетиповой конфигурации УТ и разработка собственных сервисов."
        stack={["УТ 11.5", "Управляемые формы", "Регистр накопления", "Нетиповая конфигурация"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
