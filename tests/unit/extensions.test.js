import test from "node:test";
import assert from "node:assert/strict";
import { buildExtensions } from "../../server/domain/extensions.js";
import { seed } from "../../server/db/seed.js";

const built = buildExtensions(seed.Extensions);

const byName = (name) => built.rows.find((row) => row.Name === name);

const RISKS = [
  ["ПечатьТОРГ12", "Низкий"],
  ["ОбменСWMS", "Низкий"],
  ["АРМКассира", "Средний"],
  ["ЗарплатаПлюс", "Низкий"],
  ["Документооборот", "Низкий"],
  ["МаркировкаИС", "Высокий"],
];

RISKS.forEach(([name, expected]) => {
  test(`Риск обновления расширения ${name}`, () => {
    assert.equal(byName(name).risk, expected);
  });
});

test("Всего расширений в реестре", () => {
  assert.equal(built.total, 6);
});

test("Активных расширений", () => {
  assert.equal(built.enabled, 4);
});

test("Изменённых объектов суммарно", () => {
  assert.equal(built.objects, 63);
});

test("Расширений с высоким риском", () => {
  assert.equal(built.high, 1);
});

test("Количество строк равно числу расширений", () => {
  assert.equal(built.rows.length, seed.Extensions.length);
});

test("Версия расширения сохраняется", () => {
  assert.equal(byName("ОбменСWMS").Version, "2.0.1");
});

test("Признак включения сохраняется", () => {
  assert.equal(byName("АРМКассира").Enabled, false);
});

test("Число объектов по расширению сохраняется", () => {
  assert.equal(byName("ЗарплатаПлюс").Objects, 21);
});

test("Несовместимое расширение определено как высокий риск", () => {
  const risky = built.rows.filter((row) => row.risk === "Высокий");
  assert.deepEqual(risky.map((row) => row.Name), ["МаркировкаИС"]);
});

test("Выключенное совместимое расширение получает средний риск", () => {
  assert.equal(byName("АРМКассира").risk, "Средний");
});

test("Пустой реестр даёт нулевые показатели", () => {
  const empty = buildExtensions([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.enabled, 0);
  assert.equal(empty.high, 0);
  assert.equal(empty.objects, 0);
});

test("Сумма объектов равна сумме по строкам", () => {
  const total = built.rows.reduce((sum, row) => sum + row.Objects, 0);
  assert.equal(built.objects, total);
});
