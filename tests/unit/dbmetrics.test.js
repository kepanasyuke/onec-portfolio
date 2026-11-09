import test from "node:test";
import assert from "node:assert/strict";
import { buildMetrics } from "../../server/domain/dbmetrics.js";
import { seed } from "../../server/db/seed.js";

const built = buildMetrics(seed.QueryMetrics);

const byCaption = (caption) => built.rows.find((row) => row.Caption === caption);

const SLOW = [
  ["Остатки по складам", true],
  ["Заказы покупателей за период", false],
  ["Взаиморасчёты с контрагентами", true],
  ["Движения товаров", true],
  ["Расчёт себестоимости", false],
  ["Журнал документов", false],
  ["НДС по реализации", true],
  ["Сверка взаиморасчётов", true],
];

SLOW.forEach(([caption, expected]) => {
  test(`Признак медленного запроса «${caption}»`, () => {
    assert.equal(byCaption(caption).slow, expected);
  });
});

const NEEDS_INDEX = [
  ["Остатки по складам", true],
  ["Взаиморасчёты с контрагентами", true],
  ["Движения товаров", true],
  ["НДС по реализации", false],
  ["Сверка взаиморасчётов", true],
  ["Заказы покупателей за период", false],
];

NEEDS_INDEX.forEach(([caption, expected]) => {
  test(`Кандидат на индекс «${caption}»`, () => {
    assert.equal(byCaption(caption).needsIndex, expected);
  });
});

const ADVICE = [
  ["Остатки по складам", "Составной индекс по дате и складу"],
  ["Заказы покупателей за период", "План оптимален"],
  ["НДС по реализации", "Проверить статистику"],
];

ADVICE.forEach(([caption, expected]) => {
  test(`Рекомендация по запросу «${caption}»`, () => {
    assert.equal(byCaption(caption).advice, expected);
  });
});

test("Всего запросов в профиле", () => {
  assert.equal(built.total, 8);
});

test("Медленных запросов", () => {
  assert.equal(built.slow, 5);
});

test("Кандидатов на индекс", () => {
  assert.equal(built.indexCandidates, 4);
});

test("Суммарное время выполнения", () => {
  assert.equal(built.totalMs, 7808);
});

test("Сортировка по времени убывает", () => {
  const times = built.rows.map((row) => row.ExecMs);
  assert.deepEqual(times, [...times].sort((a, b) => b - a));
});

test("Первый в списке — самый тяжёлый запрос", () => {
  assert.equal(built.rows[0].ExecMs, 2310);
});

test("Последний в списке — самый быстрый запрос", () => {
  assert.equal(built.rows.at(-1).ExecMs, 78);
});

test("Количество строк равно числу метрик", () => {
  assert.equal(built.rows.length, seed.QueryMetrics.length);
});

test("Запрос с индексом не считается кандидатом на индекс", () => {
  assert.equal(byCaption("Расчёт себестоимости").needsIndex, false);
});

test("Пустой профиль даёт нулевые показатели", () => {
  const empty = buildMetrics([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.slow, 0);
  assert.equal(empty.indexCandidates, 0);
  assert.equal(empty.totalMs, 0);
});

test("Сумма времени равна сумме по строкам", () => {
  const total = built.rows.reduce((sum, row) => sum + row.ExecMs, 0);
  assert.equal(built.totalMs, total);
});
