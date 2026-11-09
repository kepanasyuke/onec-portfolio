import { invalidateAll } from "./store.js";
import { notify } from "./toast.js";

const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const columnValue = (column, row) => (column.csv ? column.csv(row) : row[column.key]);

const lineOf = (columns) => (row) => columns.map((column) => cell(columnValue(column, row))).join(";");

const headOf = (columns) => columns.map((column) => cell(column.title)).join(";");

const saveFile = (name) => (blob) =>
  Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name }).click();

export const toCsv = (columns, rows) => [headOf(columns)].concat(rows.map(lineOf(columns))).join("\r\n");

export const downloadCsv = (name) => (columns, rows) => {
  saveFile(name)(new Blob([`\uFEFF${toCsv(columns, rows)}`], { type: "text/csv;charset=utf-8" }));
  return notify(`Выгружено строк: ${rows.length}`, "success");
};

export const copyLink = () =>
  navigator.clipboard.writeText(window.location.href).then(() => notify("Ссылка на раздел скопирована", "success"));

export const printPage = () => {
  notify("Открываю диалог печати", "info");
  window.print();
};

export const refreshData = () => {
  invalidateAll();
  notify("Данные запрошены заново", "info");
};
