export const StatusBar = ({ current, count }) => (
  <footer className="statusbar">
    <span className="statusbar__cell">Готово</span>
    <span className="statusbar__cell">Данные: демонстрационный набор (MS SQL недоступен)</span>
    <span className="statusbar__cell">{current.label}</span>
    <span className="statusbar__cell statusbar__cell--right">Разделов: {count}</span>
  </footer>
);
