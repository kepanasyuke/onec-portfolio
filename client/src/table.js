export const toggleSort = (key, ui) => ({ sort: key, dir: ui.sort === key && ui.dir === "asc" ? "desc" : "asc" });

const valueOf = (ui, row) => row[ui.sort];

const delta = (pair) => (typeof pair[0] === "number" ? pair[0] - pair[1] : String(pair[0]).localeCompare(String(pair[1]), "ru"));

const pairOf = (ui) => (left, right) => [valueOf(ui, left), valueOf(ui, right)];

const compare = (ui) => (left, right) => {
  const result = delta(pairOf(ui)(left, right));
  return ui.dir === "asc" ? result : -result;
};

export const sortRows = (ui) => (rows) => (ui.sort ? [...rows].sort(compare(ui)) : rows);

const contains = (query) => (value) => String(value).toLowerCase().includes(query.toLowerCase());

export const searchBy = (ui, fields) => (rows) => rows.filter((row) => fields.some((field) => contains(ui.q || "")(row[field])));

export const filterBy = (ui, field) => (rows) =>
  ui.filter && ui.filter !== "all" ? rows.filter((row) => row[field] === ui.filter) : rows;

export const DEFAULT_VIEW = { q: "", filter: "all", sort: null, dir: "asc" };
