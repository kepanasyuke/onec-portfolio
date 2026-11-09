import test from "node:test";
import assert from "node:assert/strict";
import { ndfl, contributions, payroll, payrollSummary } from "../../server/domain/zup.js";
import { seed } from "../../server/db/seed.js";

const NDFL_CASES = [
  [0, 0],
  [1, 0],
  [100000, 13000],
  [1000000, 130000],
  [1200000, 156000],
  [2000000, 260000],
  [2400000, 312000],
  [2400001, 312000],
  [3000000, 402000],
  [4000000, 552000],
  [5000000, 702000],
  [5000001, 702000],
  [7000000, 1062000],
  [10000000, 1602000],
  [20000000, 3402000],
  [20000001, 3402000],
  [30000000, 5402000],
  [50000000, 9402000],
  [50000001, 9402000],
  [60000000, 11602000],
  [100000000, 20402000],
];

NDFL_CASES.forEach(([base, expected]) => {
  test(`НДФЛ с годовой базы ${base}`, () => {
    assert.equal(ndfl(base), expected);
  });
});

test("НДФЛ не убывает при росте базы", () => {
  const bases = [0, 500000, 2400000, 2500000, 5000000, 6000000, 20000000, 21000000, 60000000];
  const taxes = bases.map((base) => ndfl(base));
  const sorted = [...taxes].sort((a, b) => a - b);
  assert.deepEqual(taxes, sorted);
});

test("НДФЛ не превышает 22 % базы", () => {
  [1000000, 5000000, 30000000, 120000000].forEach((base) => {
    assert.ok(ndfl(base) <= base * 0.22);
  });
});

test("НДФЛ не ниже 13 % базы на малых суммах", () => {
  [100000, 500000, 2000000].forEach((base) => {
    assert.ok(ndfl(base) >= base * 0.13);
  });
});

const CONTRIBUTION_CASES = [
  [0, 0],
  [1000000, 300000],
  [1112500, 333750],
  [2000000, 600000],
  [2225000, 667500],
  [2225001, 667500],
  [3000000, 784525],
  [4000000, 935525],
  [5000000, 1086525],
];

CONTRIBUTION_CASES.forEach(([base, expected]) => {
  test(`Страховые взносы с базы ${base}`, () => {
    assert.equal(contributions(base), expected);
  });
});

test("Взносы не убывают при росте базы", () => {
  const values = [0, 1000000, 2225000, 3000000, 5000000].map((base) => contributions(base));
  assert.deepEqual(values, [...values].sort((a, b) => a - b));
});

const EMPLOYEE_CASES = [
  ["001", 145000, 118, 26100, 171100, 22243, 148857, 51330],
  ["002", 112000, 104, 4480, 116480, 15142, 101338, 34944],
  ["003", 98000, 96, -3920, 94080, 12230, 81850, 28224],
  ["004", 87500, 112, 10500, 98000, 12740, 85260, 29400],
  ["005", 64000, 88, -7680, 56320, 7322, 48998, 16896],
  ["006", 96000, 101, 960, 96960, 12605, 84355, 29088],
];

EMPLOYEE_CASES.forEach(([tab, salary, kpi, premium, gross, tax, net, contrib]) => {
  test(`Расчёт по сотруднику ${tab}: премия и начисление`, () => {
    const row = payroll(seed.Employees).find((item) => item.Tab === tab);
    assert.equal(row.Salary, salary);
    assert.equal(row.KpiPercent, kpi);
    assert.equal(row.premium, premium);
    assert.equal(row.gross, gross);
  });

  test(`Расчёт по сотруднику ${tab}: НДФЛ, на руки и взносы`, () => {
    const row = payroll(seed.Employees).find((item) => item.Tab === tab);
    assert.equal(row.ndfl, tax);
    assert.equal(row.net, net);
    assert.equal(row.contributions, contrib);
  });

  test(`Расчёт по сотруднику ${tab}: на руки равно начислено минус НДФЛ`, () => {
    const row = payroll(seed.Employees).find((item) => item.Tab === tab);
    assert.equal(row.net, row.gross - row.ndfl);
  });
});

test("Список сотрудников совпадает с источником", () => {
  assert.equal(payroll(seed.Employees).length, seed.Employees.length);
});

test("Фонд начислений по штату", () => {
  assert.equal(payrollSummary(seed.Employees).fund, 632940);
});

test("Суммарный НДФЛ по штату", () => {
  assert.equal(payrollSummary(seed.Employees).tax, 82282);
});

test("Суммарные взносы по штату", () => {
  assert.equal(payrollSummary(seed.Employees).contributions, 189882);
});

test("На руки по штату меньше фонда на величину НДФЛ", () => {
  const summary = payrollSummary(seed.Employees);
  const net = summary.rows.reduce((sum, row) => sum + row.net, 0);
  assert.equal(net, summary.fund - summary.tax);
});

test("Фонд равен сумме начислений по строкам", () => {
  const summary = payrollSummary(seed.Employees);
  const gross = summary.rows.reduce((sum, row) => sum + row.gross, 0);
  assert.equal(summary.fund, gross);
});

test("Пустой штат даёт нулевой расчёт", () => {
  const summary = payrollSummary([]);
  assert.equal(summary.fund, 0);
  assert.equal(summary.tax, 0);
  assert.equal(summary.contributions, 0);
  assert.deepEqual(summary.rows, []);
});

test("Премия может быть отрицательной при KPI ниже нормы", () => {
  const row = payroll(seed.Employees).find((item) => item.Tab === "005");
  assert.ok(row.premium < 0);
});

test("KPI выше нормы даёт положительную премию", () => {
  const row = payroll(seed.Employees).find((item) => item.Tab === "001");
  assert.ok(row.premium > 0);
});
