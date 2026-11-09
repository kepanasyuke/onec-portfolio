import { useApi } from "../hooks.js";
import { NAV } from "../nav.js";
import { Stat, Loading, Card, DataTable } from "../components/ui.jsx";
import { num } from "../format.js";
import { IconArrow } from "../icons.jsx";

const PROJECTS = NAV.slice(1);

const REQUIREMENTS = [
  { requirement: "Разработка и поддержка на 1С, типовые и нетиповые конфигурации", project: "УТ 11.5 — заказы и резервы", link: "#ut" },
  { requirement: "Обычные и управляемые формы", project: "УТ / ДО — таблицы и карточки на управляемых формах", link: "#do" },
  { requirement: "Консультационная поддержка на УТ, БП, ЗУП, ДО", project: "Разделы 01–04 с рабочими отчётами", link: "#bp" },
  { requirement: "Разработка и поддержка сторонних сервисов компании", project: "Интеграции XML/SOAP", link: "#soap" },
  { requirement: "Нетиповые обмены между базами 1С", project: "КД 3.1 — правила конвертации", link: "#kd" },
  { requirement: "Работа с расширениями конфигураций", project: "Реестр расширений и совместимость", link: "#ext" },
  { requirement: "Знание УТ (10.x, 11.x), БП, ЗУП, ДО, КД", project: "По одному проекту на каждую конфигурацию", link: "#ut" },
  { requirement: "MS SQL, PostgreSQL: платформы, запросы, внешние источники", project: "Профиль производительности запросов", link: "#db" },
  { requirement: "Сторонние сервисы через XML и SOAP", project: "Сборка конверта и журнал обмена", link: "#soap" },
  { requirement: "Инструменты командной разработки", project: "ESLint с собственными правилами и 362 теста", link: "#overview" },
];

const REQUIREMENT_COLUMNS = [
  { key: "requirement", title: "Пункт вакансии" },
  {
    key: "project",
    title: "Где закрыт",
    render: (row) => (
      <a href={row.link} className="muted">
        {row.project}
      </a>
    ),
  },
  { key: "link", title: "", align: "right", render: (row) => <a href={row.link} className="mono" style={{ color: "var(--accent)" }}>открыть</a> },
];

const ProjectCard = ({ item }) => (
  <a className="project" href={`#${item.id}`}>
    <span className="project__icon">
      <item.icon />
    </span>
    <div className="project__body">
      <div className="project__title">
        {item.num} · {item.label}
      </div>
      <p className="project__text">{item.desc}</p>
      <div className="project__foot">
        {item.chips.map((chip) => (
          <span className="chip" key={chip}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  </a>
);

const Tiles = ({ data }) => (
  <div className="grid grid--4" style={{ marginTop: 16 }}>
    <Stat label="Заказы в работе" value={num(data.orders)} note="УТ 11.5, регистр остатков" tone="brand" />
    <Stat label="Документы на согласовании" value={num(data.documents)} note="ДО 3.0, активные маршруты" />
    <Stat label="Активных расширений" value={num(data.extensions)} note="из реестра расширений" tone="success" />
    <Stat label="Медленных запросов" value={num(data.slowQueries)} note="MS SQL, дольше 500 мс" tone="warn" />
  </div>
);

export const OverviewSection = () => {
  const { data } = useApi("/api/overview");
  return (
    <>
      <section className="hero">
        <span className="hero__tag">
          <IconArrow /> Вакансия · Программист 1С · гибрид, 5/2
        </span>
        <h1>Восемь рабочих проектов под стек вакансии — с бэкендом и фронтендом</h1>
        <p>
          Каждый раздел закрывает пункт из обязанностей и требований: типовые и нетиповые конфигурации, УТ, БП, ЗУП, ДО,
          КД, обмены XML/SOAP, расширения и работу с MS SQL. Фронтенд — React, бэкенд — Express и MS SQL, данные
          проходят через собственный слой расчётов.
        </p>
        <div className="hero__meta">
          <div>
            <span>Опыт</span>
            <strong>3–6 лет</strong>
          </div>
          <div>
            <span>Занятость</span>
            <strong>Полная, 8 ч</strong>
          </div>
          <div>
            <span>Формат</span>
            <strong>Гибрид</strong>
          </div>
          <div>
            <span>Конфигурации</span>
            <strong>УТ · БП · ЗУП · ДО · КД</strong>
          </div>
        </div>
      </section>

      {data ? <Tiles data={data} /> : <Loading />}

      <div className="page-head" style={{ marginTop: 30, marginBottom: 0 }}>
        <span className="eyebrow">Состав портфолио</span>
        <h1 style={{ fontSize: 22 }}>Восемь проектов — по одному на требование</h1>
        <p className="lead">
          Проекты связаны общим бэкендом и единым стилем. Каждый можно открыть отдельно: в нём есть живые данные,
          расчёты и пояснение, какую задачу из вакансии он закрывает.
        </p>
      </div>

      <div className="projects">
        {PROJECTS.map((item) => (
          <ProjectCard key={item.id} item={item} />
        ))}
      </div>

      <Card title="Требование вакансии → проект портфолио" subtitle="Каждый пункт обязанностей и требований закрыт рабочим разделом с кодом и данными">
        <DataTable columns={REQUIREMENT_COLUMNS} rows={REQUIREMENTS} />
      </Card>
    </>
  );
};
