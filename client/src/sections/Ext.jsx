import { useView } from "../hooks.js";
import { patchValue } from "../state.js";
import { sortRows, searchBy, filterBy, toggleSort, DEFAULT_VIEW } from "../table.js";
import { PageHead, Card, DataTable, Badge, Stat, Loading } from "../components/ui.jsx";
import { BarList } from "../components/charts.jsx";
import { Toolbar } from "../components/toolbar.jsx";
import { num } from "../format.js";
import { IconAlert } from "../icons.jsx";

const KEY = "ext";

const TONE = { Высокий: "danger", Средний: "warn", Низкий: "success" };

const tone = (risk) => TONE[risk] || "neutral";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "Низкий", label: "Низкий риск" },
  { value: "Средний", label: "Средний риск" },
  { value: "Высокий", label: "Высокий риск" },
];

const COLUMNS = [
  { key: "Name", title: "Расширение", sortable: true },
  { key: "Version", title: "Версия", sortable: true, render: (row) => <span className="mono">{row.Version}</span> },
  { key: "Config", title: "Конфигурация", sortable: true },
  { key: "Compatible", title: "Совместимость", sortable: true, render: (row) => <span className="mono">{row.Compatible}</span> },
  { key: "Objects", title: "Объектов", align: "right", sortable: true, render: (row) => num(row.Objects) },
  {
    key: "Enabled",
    title: "Включено",
    align: "center",
    sortable: true,
    render: (row) => (row.Enabled ? <Badge tone="success">Да</Badge> : <Badge tone="neutral">Нет</Badge>),
  },
  { key: "risk", title: "Риск обновления", sortable: true, render: (row) => <Badge tone={tone(row.risk)}>{row.risk}</Badge> },
];

const rowTone = (row) => (row.risk === "Высокий" ? "is-alert" : undefined);

const viewOf = (ui) => (rows) => sortRows(ui)(searchBy(ui, ["Name", "Config"])(filterBy(ui, "risk")(rows)));

const chartItems = (rows) =>
  rows.map((row) => ({ label: row.Name, value: row.Objects, tone: row.risk === "Высокий" ? "danger" : row.Enabled ? "success" : "warn" }));

const Body = ({ data, ui }) => {
  const rows = viewOf(ui)(data.rows);
  return (
    <>
      <div className="grid grid--4">
        <Stat label="Расширений в реестре" value={num(data.total)} />
        <Stat label="Активных" value={num(data.enabled)} tone="success" />
        <Stat label="Изменённых объектов" value={num(data.objects)} tone="brand" note="суммарно по расширениям" />
        <Stat label="Высокий риск" value={num(data.high)} tone={data.high ? "danger" : "success"} note="несовместимость с версией" />
      </div>

      <Card title="Объекты по расширениям" subtitle="Сколько объектов конфигурации затронуто каждым расширением">
        <BarList items={chartItems(data.rows)} format={num} />
      </Card>

      <Card title="Реестр расширений конфигураций" subtitle="Совместимость сравнивается с версией конфигурации из поля «Конфигурация»">
        <Toolbar
          query={ui.q}
          onQuery={(value) => patchValue(KEY)({ q: value })}
          filters={FILTERS}
          active={ui.filter}
          onFilter={(value) => patchValue(KEY)({ filter: value })}
          onReset={() => patchValue(KEY)({ q: "", filter: "all" })}
          exportName="Реестр расширений"
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

      <div className="note">
        <IconAlert />
        <span>
          Перед обновлением базы расширения с высоким риском нужно снять с поддержки или обновить: их версия совместимости
          ниже текущей версии конфигурации, и после обновления возможен конфликт объектов.
        </span>
      </div>
    </>
  );
};

export const ExtSection = () => {
  const { data, ui, error } = useView("/api/extensions", KEY, DEFAULT_VIEW);
  return (
    <>
      <PageHead
        index="07"
        title="Расширения конфигураций: реестр и контроль совместимости"
        lead="Учёт расширений по базам, проверка совместимости с версией конфигурации и оценка риска при обновлении. Прямо по обязанности вакансии — работа с расширениями и поддержка переработанных конфигураций."
        stack={["Расширения", "Совместимость версий", "Обновление базы", "Нетиповые доработки"]}
      />
      {data ? <Body data={data} ui={ui} /> : <Loading error={error} />}
    </>
  );
};
