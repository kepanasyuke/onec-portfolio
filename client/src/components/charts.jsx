export const BarList = ({ items, format = (value) => value, tone = "brand" }) => {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <span className="bar-row__label" title={item.label}>
            {item.label}
          </span>
          <span className="bar-row__track">
            <span
              className={`bar-row__fill bar-row__fill--${item.tone || tone}`}
              style={{ width: `${Math.max(2, Math.round((item.value / max) * 100))}%` }}
            />
          </span>
          <span className="bar-row__value">{format(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const Columns = ({ items, format = (value) => value }) => {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="columns">
      {items.map((item) => (
        <div className="columns__item" key={item.label}>
          <span className="columns__value">{format(item.value)}</span>
          <span className="columns__track">
            <span className={`columns__fill columns__fill--${item.tone || "brand"}`} style={{ height: `${Math.max(3, Math.round((item.value / max) * 100))}%` }} />
          </span>
          <span className="columns__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const Share = ({ items }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <div className="share">
      <div className="share__bar">
        {items.map((item) => (
          <span key={item.label} className={`share__part share__part--${item.tone || "brand"}`} style={{ width: `${(item.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="share__legend">
        {items.map((item) => (
          <span className="share__item" key={item.label}>
            <span className={`share__dot share__dot--${item.tone || "brand"}`} />
            {item.label}
            <strong>{item.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};
