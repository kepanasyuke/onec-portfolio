import { query } from "./connection.js";
import { seed } from "./seed.js";

const TABLES = [
  "Orders",
  "OrderLines",
  "Stock",
  "Accounts",
  "Employees",
  "Documents",
  "ExchangeRules",
  "IntegrationLog",
  "Extensions",
  "QueryMetrics",
];

const unwrap = (name) => (result) => (result ? result.recordset : seed[name]);

const loadTable = (name) => query(`SELECT * FROM dbo.${name}`).then(unwrap(name));

const zipRows = (names) => (rows) => names.reduce((acc, name, index) => ({ ...acc, [name]: rows[index] }), {});

const loadStore = () => Promise.all(TABLES.map(loadTable)).then(zipRows(TABLES));

let storePromise = null;

export const getStore = () => {
  storePromise = storePromise || loadStore();
  return storePromise;
};
