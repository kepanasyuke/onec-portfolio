import { IconAlert } from "../icons.jsx";

export const Badge = ({ tone = "neutral", children }) => <span className={`badge badge--${tone}`}>{children}</span>;

export const Button = ({ icon, variant = "default", size = "md", disabled, active, onClick, title, children }) => (
  <button type="button" className={buttonClass(variant, size, active)} onClick={onClick} disabled={disabled} title={title}>
    <ButtonIcon icon={icon} />
    <ButtonLabel>{children}</ButtonLabel>
  </button>
);

const buttonClass = (variant, size, active) =>
  ["btn", `btn--${variant}`, `btn--${size}`, active ? "is-active" : ""].join(" ").trim();

const ButtonIcon = ({ icon: Icon }) => (Icon ? <Icon /> : null);

const ButtonLabel = ({ children }) => (children ? <span>{children}</span> : null);

export const Tag = ({ children }) => <span className="tag">{children}</span>;

export const Stat = ({ label, value, note, tone = "neutral" }) => (
  <div className={`stat stat--${tone}`}>
    <span className="stat__label">{label}</span>
    <strong className="stat__value">{value}</strong>
    {note ? <span className="stat__note">{note}</span> : null}
  </div>
);

const CardHead = ({ title, subtitle, actions }) => (
  <header className="card__head">
    <div>
      <h3 className="card__title">{title}</h3>
      {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
    </div>
    {actions ? <div className="card__actions">{actions}</div> : null}
  </header>
);

export const Card = ({ title, subtitle, actions, children }) => (
  <section className="card">
    {title ? <CardHead title={title} subtitle={subtitle} actions={actions} /> : null}
    {children}
  </section>
);

const SortMark = ({ active, dir }) => (active ? <span className="sort-mark">{dir === "asc" ? "▲" : "▼"}</span> : null);

const thClass = (column) => ["table__th", column.align ? `is-${column.align}` : "", column.sortable ? "is-sortable" : ""].join(" ").trim();

const ariaOf = (active) => (dir) => (active ? (dir === "asc" ? "ascending" : "descending") : "none");

const sortState = (column, sort, dir) => (column.sortable ? ariaOf(sort === column.key)(dir) : undefined);

const Th = ({ column, sort, dir, onSort }) => (
  <th
    className={thClass(column)}
    aria-sort={sortState(column, sort, dir)}
    onClick={column.sortable ? () => onSort(column.key) : undefined}
  >
    {column.title}
    <SortMark active={column.sortable && sort === column.key} dir={dir} />
  </th>
);

export const DataTable = ({ columns, rows, rowClass, sort, dir, onSort, empty = "Нет данных" }) => (
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <Th key={column.key} column={column} sort={sort} dir={dir} onSort={onSort} />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row, index) => (
            <tr key={row.id || index} className={rowClass ? rowClass(row) : undefined}>
              {columns.map((column) => (
                <td key={column.key} className={column.align ? `is-${column.align}` : undefined}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="is-empty">
              {empty}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const Code = ({ caption, children }) => (
  <div className="code">
    {caption ? <span className="code__caption">{caption}</span> : null}
    <pre>{children}</pre>
  </div>
);

export const Meter = ({ value, max, tone = "brand" }) => (
  <div className={`meter meter--${tone}`}>
    <span style={{ width: `${Math.min(100, Math.round((value / Math.max(max, 1)) * 100))}%` }} />
  </div>
);

const Dots = () => (
  <div className="loading" role="status" aria-label="Загрузка данных">
    <span className="loading__dot" />
    <span className="loading__dot" />
    <span className="loading__dot" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="note note--danger" style={{ marginTop: 10 }} role="alert">
    <IconAlert />
    <span>
      Не удалось получить данные: {message}. Проверьте, что API запущен на порту 4000, и нажмите «Обновить» в шапке.
    </span>
  </div>
);

export const Loading = ({ error }) => (error ? <ErrorState message={error} /> : <Dots />);

export const PageHead = ({ index, title, lead, stack, children }) => (
  <header className="page-head">
    <div className="page-head__top">
      <span className="eyebrow">Проект {index}</span>
      {children}
    </div>
    <h1>{title}</h1>
    <p className="lead">{lead}</p>
    {stack ? (
      <div className="tags">
        {stack.map((item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    ) : null}
  </header>
);
