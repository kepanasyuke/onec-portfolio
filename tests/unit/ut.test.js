import test from "node:test";
import assert from "node:assert/strict";
import { linesOf, lineTotal, orderAmount, shortages, buildOrders, buildReservePlan, ordersSummary } from "../../server/domain/ut.js";
import { seed } from "../../server/db/seed.js";

const LINE_CASES = [
  [2, 48200, 96400],
  [12, 950, 11400],
  [4, 103000, 412000],
  [8, 950, 7600],
  [15, 1270, 19050],
  [1, 103000, 103000],
  [40, 1270, 50800],
  [0, 1270, 0],
];

LINE_CASES.forEach(([qty, price, expected]) => {
  test(`Стоимость строки ${qty} × ${price}`, () => {
    assert.equal(lineTotal({ Qty: qty, Price: price }), expected);
  });
});

const ORDER_TOTALS = [
  ["УТ-00101", 107800],
  ["УТ-00102", 96400],
  ["УТ-00103", 412000],
  ["УТ-00104", 26650],
  ["УТ-00105", 153800],
];

ORDER_TOTALS.forEach(([number, expected]) => {
  test(`Сумма заказа ${number}`, () => {
    assert.equal(orderAmount(linesOf(seed.OrderLines, number)), expected);
  });
});

const LINE_COUNTS = [
  ["УТ-00101", 2],
  ["УТ-00102", 1],
  ["УТ-00103", 1],
  ["УТ-00104", 2],
  ["УТ-00105", 2],
];

LINE_COUNTS.forEach(([number, expected]) => {
  test(`Количество строк заказа ${number}`, () => {
    assert.equal(linesOf(seed.OrderLines, number).length, expected);
  });
});

test("Неизвестный заказ не содержит строк", () => {
  assert.deepEqual(linesOf(seed.OrderLines, "УТ-99999"), []);
});

test("Пустой список строк не создаёт дефицита", () => {
  assert.deepEqual(shortages(seed.Stock)([]), []);
});

const PROBLEMS = [
  ["УТ-00103", "Редуктор РМ-250", 2],
  ["УТ-00105", "Кран шаровой Ду50", 10],
];

PROBLEMS.forEach(([order, nomenclature, missing]) => {
  test(`Дефицит по заказу ${order}: ${nomenclature}`, () => {
    const gaps = shortages(seed.Stock)(linesOf(seed.OrderLines, order));
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].Nomenclature, nomenclature);
    assert.equal(gaps[0].missing, missing);
  });
});

test("Заказ УТ-00101 полностью обеспечен", () => {
  assert.deepEqual(shortages(seed.Stock)(linesOf(seed.OrderLines, "УТ-00101")), []);
});

test("Заказ УТ-00102 полностью обеспечен", () => {
  assert.deepEqual(shortages(seed.Stock)(linesOf(seed.OrderLines, "УТ-00102")), []);
});

test("Заказ УТ-00104 полностью обеспечен", () => {
  assert.deepEqual(shortages(seed.Stock)(linesOf(seed.OrderLines, "УТ-00104")), []);
});

test("Остаток склада суммируется по всем складам", () => {
  const gaps = shortages(seed.Stock)([{ Nomenclature: "Насос центробежный НЦ-50", Qty: 4, Price: 1 }]);
  assert.deepEqual(gaps, []);
});

test("Нехватка возникает при превышении суммарного остатка", () => {
  const gaps = shortages(seed.Stock)([{ Nomenclature: "Насос центробежный НЦ-50", Qty: 5, Price: 1 }]);
  assert.equal(gaps[0].missing, 1);
});

const BUILT = buildOrders(seed);

test("Список заказов совпадает с источником", () => {
  assert.equal(BUILT.length, seed.Orders.length);
});

ORDER_TOTALS.forEach(([number, expected]) => {
  test(`Собранный заказ ${number} содержит рассчитанную сумму`, () => {
    const order = BUILT.find((item) => item.Number === number);
    assert.equal(order.total, expected);
  });
});

ORDER_TOTALS.forEach(([number]) => {
  test(`Собранный заказ ${number} содержит строки`, () => {
    const order = BUILT.find((item) => item.Number === number);
    assert.ok(order.lines.length > 0);
  });
});

test("Итоговая сумма по всем заказам", () => {
  assert.equal(ordersSummary(seed).amount, 796650);
});

test("Количество заказов в сводке", () => {
  assert.equal(ordersSummary(seed).count, 5);
});

test("Сводка содержит два проблемных места", () => {
  assert.equal(ordersSummary(seed).problems.length, 2);
});

test("Проблемные места содержат номер заказа", () => {
  const orders = ordersSummary(seed).problems.map((problem) => problem.order);
  assert.deepEqual(orders, ["УТ-00103", "УТ-00105"]);
});

test("План резерва для обеспеченного заказа готов к отгрузке", () => {
  assert.equal(buildReservePlan(seed)("УТ-00101").ready, true);
});

test("План резерва для дефицитного заказа не готов", () => {
  assert.equal(buildReservePlan(seed)("УТ-00103").ready, false);
});

test("План резерва содержит строки заказа", () => {
  assert.equal(buildReservePlan(seed)("УТ-00105").lines.length, 2);
});

test("План резерва содержит только дефицитные строки", () => {
  const plan = buildReservePlan(seed)("УТ-00105");
  assert.equal(plan.gaps.length, 1);
  assert.equal(plan.gaps[0].Nomenclature, "Кран шаровой Ду50");
});

test("Пустой заказ даёт пустой план", () => {
  const plan = buildReservePlan(seed)("УТ-99999");
  assert.deepEqual(plan.lines, []);
  assert.equal(plan.ready, true);
});

test("Расхождение реквизита суммы с расчётом видно на заказе УТ-00101", () => {
  const order = BUILT.find((item) => item.Number === "УТ-00101");
  assert.notEqual(order.total, order.Amount);
});

test("Реквизит суммы заказа УТ-00103 совпадает с расчётом", () => {
  const order = BUILT.find((item) => item.Number === "УТ-00103");
  assert.equal(order.total, order.Amount);
});
