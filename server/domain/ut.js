const byOrder = (orderNumber) => (line) => line.OrderNumber === orderNumber;

export const linesOf = (lines, orderNumber) => lines.filter(byOrder(orderNumber));

export const lineTotal = (line) => line.Qty * line.Price;

export const orderAmount = (lines) => lines.reduce((sum, line) => sum + lineTotal(line), 0);

const availableOf = (stock, name) =>
  stock.filter((row) => row.Nomenclature === name).reduce((sum, row) => sum + row.Available, 0);

const missingOf = (stock) => (line) => Math.max(0, line.Qty - availableOf(stock, line.Nomenclature));

export const shortages = (stock) => (lines) =>
  lines.map((line) => ({ ...line, missing: missingOf(stock)(line) })).filter((line) => line.missing > 0);

const withLines = (lines) => (order) =>
  Object.assign({}, order, { lines: linesOf(lines, order.Number), total: orderAmount(linesOf(lines, order.Number)) });

export const buildOrders = (store) => store.Orders.map(withLines(store.OrderLines));

const plan = (lines) => (gaps) => ({ lines, gaps, ready: gaps.length === 0, shortageValue: gaps.length });

export const buildReservePlan = (store) => (orderNumber) => {
  const lines = linesOf(store.OrderLines, orderNumber);
  return plan(lines)(shortages(store.Stock)(lines));
};

const problemsOf = (store) => (orders) =>
  orders.flatMap((order) => shortages(store.Stock)(order.lines).map((line) => Object.assign({}, line, { order: order.Number })));

export const ordersSummary = (store) => {
  const orders = buildOrders(store);
  return {
    count: orders.length,
    amount: orders.reduce((sum, order) => sum + order.total, 0),
    rows: orders,
    problems: problemsOf(store)(orders),
  };
};
