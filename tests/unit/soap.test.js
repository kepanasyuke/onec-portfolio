import test from "node:test";
import assert from "node:assert/strict";
import { buildEnvelope, buildLog, sampleEnvelope } from "../../server/domain/soap.js";
import { seed } from "../../server/db/seed.js";

const envelope = buildEnvelope("CRM.Sync", "GetOrders", "<erp:DateFrom>2026-11-01</erp:DateFrom>");

const CONTAINS = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  "soap:Envelope",
  "schemas.xmlsoap.org/soap/envelope/",
  "xmlns:erp",
  "soap:Header",
  "soap:Body",
  "<erp:Service>CRM.Sync</erp:Service>",
  "<erp:GetOrders>",
  "</erp:GetOrders>",
  "</soap:Envelope>",
  "<erp:DateFrom>2026-11-01</erp:DateFrom>",
];

CONTAINS.forEach((fragment) => {
  test(`SOAP-конверт содержит «${fragment}»`, () => {
    assert.ok(envelope.includes(fragment));
  });
});

test("SOAP-конверт начинается с XML-декларации", () => {
  assert.ok(envelope.startsWith("<?xml"));
});

test("SOAP-конверт содержит 9 строк", () => {
  assert.equal(envelope.split("\n").length, 9);
});

test("Заголовок конверта содержит имя сервиса", () => {
  assert.ok(envelope.includes("CRM.Sync"));
});

test("Демонстрационный конверт собран", () => {
  assert.ok(sampleEnvelope().includes("CRM.Sync"));
});

test("Демонстрационный конверт содержит операцию GetOrders", () => {
  assert.ok(sampleEnvelope().includes("GetOrders"));
});

test("Демонстрационный конверт содержит период выборки", () => {
  assert.ok(sampleEnvelope().includes("2026-11-08"));
});

const log = buildLog(seed.IntegrationLog);

test("Всего обменов в журнале", () => {
  assert.equal(log.total, 8);
});

test("Успешных обменов", () => {
  assert.equal(log.success, 5);
});

test("Обменов с ошибкой", () => {
  assert.equal(log.failed, 3);
});

test("Среднее время обмена", () => {
  assert.equal(log.avgMs, 1738);
});

test("Максимальное время обмена", () => {
  assert.equal(log.maxMs, 8000);
});

test("Успешные и неуспешные обмены дают в сумме все", () => {
  assert.equal(log.success + log.failed, log.total);
});

test("Строки журнала не изменяются", () => {
  assert.deepEqual(log.rows, seed.IntegrationLog);
});

test("Журнал содержит таймаут", () => {
  assert.ok(log.rows.some((row) => row.Status === "Таймаут"));
});

test("Журнал содержит ошибку схемы", () => {
  assert.ok(log.rows.some((row) => row.Status === "Ошибка схемы"));
});

test("Пустой журнал не делит на ноль", () => {
  const empty = buildLog([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.avgMs, 0);
  assert.equal(empty.maxMs, 0);
});
