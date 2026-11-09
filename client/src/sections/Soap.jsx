import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, filterBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading, Code } from "../components/ui.jsx";
import { Columns } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { ms, num } from "../format.js";

const KEY = "soap";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "Успех", label: "Успешные" },
  { value: "Таймаут", label: "Таймауты" },
  { value: "Ошибка схемы", label: "Ошибки схемы" },
];

const COLUMNS = [
  { key: "Id", title: "#", sortable: true, render: (row) => <span className="mono">{row.Id}</span> },
  { key: "Service", title: "Сервис", sortable: true },
  { key: "Operation", title: "Операция", sortable: true },
  { key: "Direction", title: "Направление", sortable: true, render: (row) => <Badge tone="neutral">{row.Direction}</Badge> },
  {
    key: "Status",
    title: "Результат",
    sortable: true,
    render: (row) => <Badge tone={row.Status === "Успех" ? "success" : "danger"}>{row.Status}</Badge>,
  },
  { key: "DurationMs", title: "Время", align: "right", sortable: true, render: (row) => ms(row.DurationMs) },
];

const rowTone = (row) => (row.Status === "Успех" ? undefined : "is-alert");

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Service", "Operation"])(filterBy(ui, "Status")(rows)));

const chartItems = (rows) =>
  rows.map((row) => ({ label: `${row.Service.split(".")[0]}-${row.Id}`, value: row.DurationMs, tone: row.Status === "Успех" ? "success" : "danger" }));

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Обменов" value={num(data.total)} />
        <Stat label="Успешных" value={num(data.success)} tone="success" />
        <Stat label="С ошибкой" value={num(data.failed)} tone={data.failed ? "danger" : "success"} />
        <Stat label="Среднее время" value={ms(data.avgMs)} tone="brand" note={`пик ${ms(data.maxMs)}`} />
      </div>

      <Card title="Длительность обменов" subtitle="Красные столбцы — вызовы, завершившиеся ошибкой или таймаутом">
        <Columns items={chartItems(data.rows)} format={ms} />
      </Card>

      <Card title="Журнал обмена" subtitle="Каждый вызов фиксируется с длительностью и результатом">
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Журнал обмена"
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

      <Card title="SOAP-конверт запроса" subtitle="Формируется кодом 1С и уходит внешнему сервису по HTTPS">
        <Code caption="service.wsdl · GetOrders">{data.envelope}</Code>
      </Card>
    </>
  );
};

export const SoapSection = () => {
  const { data, ui, error } = useView("/api/soap/log", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="06"
        title="Обмены XML/SOAP со сторонними сервисами"
        lead="Сборка SOAP-конверта, разбор ответа по XSD и журнал интеграций: таймауты, ошибки схемы и отказы сервиса видны сразу. Закрывает требование вакансии по работе с XML и SOAP, а также поддержке сторонних сервисов компании."
        stack={["SOAP 1.2", "XSD", "Журнал обмена", "HTTPS"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
