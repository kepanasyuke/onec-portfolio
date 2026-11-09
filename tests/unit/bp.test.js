import test from "node:test";
import assert from "node:assert/strict";
import { buildOsv, redSaldo } from "../../server/domain/bp.js";
import { seed } from "../../server/db/seed.js";

const rows = buildOsv(seed.Accounts).rows;

const byCode = (code) => rows.find((row) => row.Code === code);

const CLOSING_DT = [
  ["50", 27000],
  ["51", 2680000],
  ["60", -320000],
  ["62", 1240000],
  ["41", 1800000],
  ["43", 520000],
  ["10", -50000],
  ["70", -25000],
  ["68.01", -3000],
  ["90.01", -6120000],
  ["90.02", 6633000],
];

CLOSING_DT.forEach(([code, expected]) => {
  test(`Сальдо конечное Дт по счёту ${code}`, () => {
    assert.equal(byCode(code).closingDt, expected);
  });
});

const CLOSING_KT = [
  ["50", -15000],
  ["51", -230000],
  ["60", 1500000],
  ["62", -260000],
  ["41", 70000],
  ["43", 120000],
  ["10", 480000],
  ["70", 745000],
  ["68.01", 96000],
  ["90.01", 6120000],
  ["90.02", -6633000],
];

CLOSING_KT.forEach(([code, expected]) => {
  test(`Сальдо конечное Кт по счёту ${code}`, () => {
    assert.equal(byCode(code).closingKt, expected);
  });
});

const BALANCE = [
  ["50", 27000],
  ["51", 2680000],
  ["60", 1500000],
  ["62", 1240000],
  ["41", 1800000],
  ["43", 520000],
  ["10", -50000],
  ["70", 745000],
  ["68.01", 96000],
  ["90.01", 6120000],
  ["90.02", 6633000],
];

BALANCE.forEach(([code, expected]) => {
  test(`Итоговое сальдо по счёту ${code}`, () => {
    assert.equal(byCode(code).balance, expected);
  });
});

const RED = [["10", true]];

RED.forEach(([code, expected]) => {
  test(`Признак красного сальдо по счёту ${code}`, () => {
    assert.equal(byCode(code).red, expected);
  });
});

test("Пассивный счёт 60 не считается красным при кредитовом остатке", () => {
  assert.equal(byCode("60").red, false);
});

test("Пассивный счёт 70 не считается красным", () => {
  assert.equal(byCode("70").red, false);
});

test("Активный счёт с отрицательным остатком признан красным", () => {
  assert.equal(byCode("10").red, true);
});

test("Оборот по дебету сходится с источником", () => {
  assert.equal(buildOsv(seed.Accounts).totals.debit, 21066000);
});

test("Оборот по кредиту сходится с источником", () => {
  assert.equal(buildOsv(seed.Accounts).totals.credit, 21066000);
});

test("Обороты признаны сбалансированными", () => {
  assert.equal(buildOsv(seed.Accounts).balanced, true);
});

test("Расхождение оборотов равно нулю", () => {
  assert.equal(buildOsv(seed.Accounts).delta, 0);
});

test("Красное сальдо содержит только счёт 10", () => {
  assert.deepEqual(redSaldo(seed.Accounts).map((row) => row.Code), ["10"]);
});

test("Количество строк ведомости равно числу счетов", () => {
  assert.equal(rows.length, seed.Accounts.length);
});

test("Строки ведомости сохраняют наименование счёта", () => {
  assert.equal(byCode("51").Name, "Расчётные счета");
});

test("Вид счёта сохраняется без изменений", () => {
  assert.equal(byCode("60").Kind, "Пассивный");
});

test("Пустая ведомость сбалансирована", () => {
  assert.equal(buildOsv([]).balanced, true);
});

test("Пустая ведомость не содержит красного сальдо", () => {
  assert.deepEqual(buildOsv([]).red, []);
});

test("Нарушение баланса фиксируется при расхождении оборотов", () => {
  const broken = [...seed.Accounts, { Code: "99", Name: "Тест", Kind: "Активный", OpenDt: 0, OpenKt: 0, TurnDt: 1000, TurnKt: 0 }];
  const osv = buildOsv(broken);
  assert.equal(osv.balanced, false);
  assert.equal(osv.delta, 1000);
});
