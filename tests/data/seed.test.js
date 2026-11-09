import test from "node:test";
import assert from "node:assert/strict";
import { seed } from "../../server/db/seed.js";

const TABLES = Object.keys(seed);

test("Набор данных содержит все таблицы проекта", () => {
  assert.deepEqual(TABLES.sort(), [
    "Accounts",
    "Documents",
    "Employees",
    "ExchangeRules",
    "Extensions",
    "IntegrationLog",
    "OrderLines",
    "Orders",
    "QueryMetrics",
    "Stock",
  ]);
});

TABLES.forEach((table) => {
  test(`Таблица ${table} не пуста`, () => {
    assert.ok(seed[table].length > 0);
  });
});

TABLES.forEach((table) => {
  test(`Таблица ${table} содержит ровно один набор колонок`, () => {
    const first = Object.keys(seed[table][0]).sort().join(",");
    seed[table].forEach((row) => assert.equal(Object.keys(row).sort().join(","), first));
  });
});

TABLES.forEach((table) => {
  test(`Таблица ${table} не содержит undefined-значений`, () => {
    seed[table].forEach((row) => Object.values(row).forEach((value) => assert.notEqual(value, undefined)));
  });
});

test("Все заказы имеют номер и клиента", () => {
  seed.Orders.forEach((order) => {
    assert.ok(order.Number);
    assert.ok(order.Client);
  });
});

test("Номера заказов уникальны", () => {
  const numbers = seed.Orders.map((order) => order.Number);
  assert.equal(new Set(numbers).size, numbers.length);
});

test("Все строки заказов ссылаются на существующий заказ", () => {
  const numbers = new Set(seed.Orders.map((order) => order.Number));
  seed.OrderLines.forEach((line) => assert.ok(numbers.has(line.OrderNumber)));
});

test("Все остатки имеют неотрицательное количество", () => {
  seed.Stock.forEach((row) => assert.ok(row.Available >= 0));
});

test("Все счета имеют код и вид", () => {
  seed.Accounts.forEach((account) => {
    assert.ok(account.Code);
    assert.ok(["Активный", "Пассивный"].includes(account.Kind));
  });
});

test("Коды счетов уникальны", () => {
  const codes = seed.Accounts.map((account) => account.Code);
  assert.equal(new Set(codes).size, codes.length);
});

test("Оклады сотрудников положительны", () => {
  seed.Employees.forEach((employee) => assert.ok(employee.Salary > 0));
});

test("Табельные номера уникальны", () => {
  const tabs = seed.Employees.map((employee) => employee.Tab);
  assert.equal(new Set(tabs).size, tabs.length);
});

test("Номера документов уникальны", () => {
  const numbers = seed.Documents.map((document) => document.Number);
  assert.equal(new Set(numbers).size, numbers.length);
});

test("Правила обмена имеют карту соответствия", () => {
  seed.ExchangeRules.forEach((rule) => assert.ok(rule.Fields.includes("→")));
});

test("Журнал обмена имеет уникальные идентификаторы", () => {
  const ids = seed.IntegrationLog.map((entry) => entry.Id);
  assert.equal(new Set(ids).size, ids.length);
});

test("Версии расширений в формате x.y.z", () => {
  seed.Extensions.forEach((extension) => assert.match(extension.Version, /^\d+\.\d+\.\d+$/));
});

test("Метрики запросов имеют положительное время", () => {
  seed.QueryMetrics.forEach((metric) => assert.ok(metric.ExecMs > 0));
});
