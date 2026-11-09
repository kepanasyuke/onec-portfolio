import test from "node:test";
import assert from "node:assert/strict";
import { buildDocuments, routes } from "../../server/domain/do.js";
import { seed } from "../../server/db/seed.js";

const built = buildDocuments(seed.Documents);

const byNumber = (number) => built.rows.find((row) => row.Number === number);

const NORMS = [
  ["ДО-241", 24],
  ["ДО-242", 0],
  ["ДО-243", 48],
  ["ДО-244", 4],
  ["ДО-245", 8],
  ["ДО-246", 0],
];

NORMS.forEach(([number, expected]) => {
  test(`Норматив SLA для документа ${number}`, () => {
    assert.equal(byNumber(number).norm, expected);
  });
});

const OVERDUE = [
  ["ДО-241", true],
  ["ДО-242", false],
  ["ДО-243", true],
  ["ДО-244", true],
  ["ДО-245", true],
  ["ДО-246", false],
];

OVERDUE.forEach(([number, expected]) => {
  test(`Признак просрочки для документа ${number}`, () => {
    assert.equal(byNumber(number).overdue, expected);
  });
});

const REMAINING = [
  ["ДО-241", 0],
  ["ДО-242", 0],
  ["ДО-243", 0],
  ["ДО-244", 0],
  ["ДО-245", 0],
  ["ДО-246", 0],
];

REMAINING.forEach(([number, expected]) => {
  test(`Остаток норматива для документа ${number}`, () => {
    assert.equal(byNumber(number).remaining, expected);
  });
});

test("Завершённый документ не считается просроченным", () => {
  assert.equal(byNumber("ДО-242").overdue, false);
});

test("Черновик без маршрута не считается просроченным", () => {
  assert.equal(byNumber("ДО-246").overdue, false);
});

test("Документ на юридическом согласовании просрочен", () => {
  assert.equal(byNumber("ДО-241").overdue, true);
});

test("Количество просроченных документов", () => {
  assert.equal(built.overdue, 4);
});

test("Количество документов на согласовании", () => {
  assert.equal(built.active, 3);
});

test("Суммарное время документов в работе", () => {
  assert.equal(built.totalHours, 103);
});

test("Количество строк равно числу документов", () => {
  assert.equal(built.rows.length, seed.Documents.length);
});

test("Статусы документов сохраняются", () => {
  assert.equal(byNumber("ДО-244").Status, "Отклонён");
});

test("Шаг маршрута сохраняется", () => {
  assert.equal(byNumber("ДО-243").Step, "Финансовый отдел");
});

test("Автор документа сохраняется", () => {
  assert.equal(byNumber("ДО-241").Author, "Никитина О. Л.");
});

test("Уникальные шаги маршрутов", () => {
  assert.equal(routes(seed.Documents).length, 6);
});

test("Пустой список документов даёт нулевые показатели", () => {
  const empty = buildDocuments([]);
  assert.equal(empty.overdue, 0);
  assert.equal(empty.active, 0);
  assert.equal(empty.totalHours, 0);
});

test("Пустой список маршрутов не содержит дублей", () => {
  assert.deepEqual(routes([]), []);
});
