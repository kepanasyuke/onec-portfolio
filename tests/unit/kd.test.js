import test from "node:test";
import assert from "node:assert/strict";
import { parseFields, toXml, exchangeSummary } from "../../server/domain/kd.js";
import { seed } from "../../server/db/seed.js";

const QUALITY = [
  ["КД-01", 99.8],
  ["КД-02", 99.2],
  ["КД-03", 100],
  ["КД-04", 99.9],
  ["КД-05", 97.8],
];

const STATUS = [
  ["КД-01", "Доработка"],
  ["КД-02", "Проверить"],
  ["КД-03", "Готово"],
  ["КД-04", "Доработка"],
  ["КД-05", "Проверить"],
];

const summary = exchangeSummary(seed.ExchangeRules);

const byCode = (code) => summary.rows.find((row) => row.Code === code);

QUALITY.forEach(([code, expected]) => {
  test(`Качество правила ${code}`, () => {
    assert.equal(byCode(code).quality, expected);
  });
});

STATUS.forEach(([code, expected]) => {
  test(`Статус правила ${code}`, () => {
    assert.equal(byCode(code).status, expected);
  });
});

seed.ExchangeRules.forEach((rule) => {
  test(`Карта соответствия ${rule.Code} содержит три пары`, () => {
    assert.equal(parseFields(rule.Fields).length, 3);
  });
});

seed.ExchangeRules.forEach((rule) => {
  test(`Пары правила ${rule.Code} состоят из двух элементов`, () => {
    parseFields(rule.Fields).forEach((pair) => assert.equal(pair.length, 2));
  });
});

test("Разбор пары «Источник → Приёмник»", () => {
  assert.deepEqual(parseFields("Наименование→Name")[0], ["Наименование", "Name"]);
});

test("Разбор нескольких пар", () => {
  assert.deepEqual(parseFields("А→B; C→D"), [
    ["А", "B"],
    ["C", "D"],
  ]);
});

test("Пробелы вокруг стрелки обрезаются", () => {
  assert.deepEqual(parseFields("Сумма → Total")[0], ["Сумма", "Total"]);
});

test("Итого объектов к переносу", () => {
  assert.equal(summary.objects, 7607);
});

test("Итого ошибок соответствия", () => {
  assert.equal(summary.issues, 13);
});

test("Количество правил в сводке", () => {
  assert.equal(summary.rows.length, 5);
});

test("XML содержит тип приёмника", () => {
  assert.ok(summary.sample.includes("Справочник.Номенклатура (БП)"));
});

test("XML содержит теги по карте соответствия", () => {
  const xml = toXml(summary.rows[0], { Наименование: "Насос", Артикул: "НЦ-50", СтавкаНДС: "20" });
  assert.equal(xml, "<Object><Type>Справочник.Номенклатура (БП)</Type><Name>Насос</Name><Code>НЦ-50</Code><VatRate>20</VatRate></Object>");
});

test("XML подставляет пустую строку при отсутствии поля", () => {
  const xml = toXml(summary.rows[0], {});
  assert.equal(xml, "<Object><Type>Справочник.Номенклатура (БП)</Type><Name></Name><Code></Code><VatRate></VatRate></Object>");
});

test("XML экранирует только значения, а не структуру", () => {
  const xml = toXml(summary.rows[0], { Наименование: "Насос & Кран" });
  assert.ok(xml.includes("Насос & Кран"));
});

test("Правило без ошибок имеет качество 100 %", () => {
  assert.equal(byCode("КД-03").quality, 100);
});

test("Итоговое качество выше 97 %", () => {
  assert.ok(summary.rows.every((row) => row.quality >= 97));
});
