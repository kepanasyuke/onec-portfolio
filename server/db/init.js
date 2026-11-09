import sql from "mssql";
import { dbConfig } from "../config.js";
import { seed } from "./seed.js";

const masterConfig = { ...dbConfig, database: "master" };

const COLUMNS = {
  Orders: "[Number] NVARCHAR(20) NOT NULL, [Client] NVARCHAR(120), [Warehouse] NVARCHAR(60), [Status] NVARCHAR(40), [Amount] DECIMAL(18,2)",
  OrderLines: "[OrderNumber] NVARCHAR(20), [Nomenclature] NVARCHAR(120), [Qty] INT, [Price] DECIMAL(18,2)",
  Stock: "[Nomenclature] NVARCHAR(120), [Warehouse] NVARCHAR(60), [Available] INT",
  Accounts: "[Code] NVARCHAR(10), [Name] NVARCHAR(120), [Kind] NVARCHAR(20), [OpenDt] DECIMAL(18,2), [OpenKt] DECIMAL(18,2), [TurnDt] DECIMAL(18,2), [TurnKt] DECIMAL(18,2)",
  Employees: "[Tab] NVARCHAR(10), [FullName] NVARCHAR(120), [Position] NVARCHAR(80), [Department] NVARCHAR(60), [Salary] DECIMAL(18,2), [KpiPercent] INT",
  Documents: "[Number] NVARCHAR(20), [Title] NVARCHAR(160), [Author] NVARCHAR(80), [Status] NVARCHAR(40), [Step] NVARCHAR(60), [Hours] INT",
  ExchangeRules: "[Code] NVARCHAR(12), [Source] NVARCHAR(120), [Target] NVARCHAR(120), [Fields] NVARCHAR(400), [Objects] INT, [Issues] INT",
  IntegrationLog: "[Id] INT, [Service] NVARCHAR(40), [Operation] NVARCHAR(40), [Direction] NVARCHAR(20), [Status] NVARCHAR(40), [DurationMs] INT",
  Extensions: "[Name] NVARCHAR(60), [Version] NVARCHAR(20), [Config] NVARCHAR(60), [Compatible] NVARCHAR(20), [Enabled] BIT, [Objects] INT",
  QueryMetrics: "[Caption] NVARCHAR(120), [Table] NVARCHAR(60), [ExecMs] INT, [Rows] INT, [IndexUsed] BIT",
};

const quoteIfText = (value) => (typeof value === "number" ? String(value) : `N'${String(value).replace(/'/g, "''")}'`);

const esc = (value) => (typeof value === "boolean" ? String(Number(value)) : quoteIfText(value));

const columnsOf = (rows) => Object.keys(rows[0]);

const valuesOf = (row) => `(${Object.values(row).map(esc).join(", ")})`;

const insertSql = (table, rows) =>
  `INSERT INTO dbo.${table} (${columnsOf(rows).join(", ")}) VALUES ${rows.map(valuesOf).join(", ")};`;

const createSql = (table, columns) =>
  `IF OBJECT_ID(N'dbo.${table}', N'U') IS NOT NULL DROP TABLE dbo.${table}; CREATE TABLE dbo.${table} (${columns});`;

const ddl = Object.entries(COLUMNS).map(([table, columns]) => createSql(table, columns));

const inserts = Object.entries(seed).map(([table, rows]) => insertSql(table, rows));

const ensureDatabase = (pool) =>
  pool.request().batch(`IF DB_ID(N'${dbConfig.database}') IS NULL CREATE DATABASE [${dbConfig.database}];`);

const master = await new sql.ConnectionPool(masterConfig).connect();

await ensureDatabase(master);
await master.close();

const target = await new sql.ConnectionPool(dbConfig).connect();

await target.request().batch([...ddl, ...inserts].join("\n"));
await target.close();

console.log(`Готово: база ${dbConfig.database} создана, таблиц — ${ddl.length}, записей — ${inserts.length}.`);
