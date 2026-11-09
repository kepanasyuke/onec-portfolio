import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../../server/app.js";

const server = createApp().listen(0);

await new Promise((resolve) => server.once("listening", resolve));

const base = `http://127.0.0.1:${server.address().port}`;

test.after(() => server.close());

const get = async (path) => {
  const response = await fetch(`${base}${path}`);
  return { status: response.status, body: await response.json() };
};

const ENDPOINTS = [
  "/api/health",
  "/api/overview",
  "/api/ut/orders",
  "/api/bp/osv",
  "/api/zup/payroll",
  "/api/do/documents",
  "/api/kd/exchange",
  "/api/soap/log",
  "/api/extensions",
  "/api/db/metrics",
];

ENDPOINTS.forEach((path) => {
  test(`Эндпоинт ${path} отвечает 200`, async () => {
    const response = await get(path);
    assert.equal(response.status, 200);
  });
});

test("Эндпоинт здоровья возвращает ok", async () => {
  assert.equal((await get("/api/health")).body.status, "ok");
});

test("Эндпоинт здоровья возвращает время", async () => {
  assert.ok((await get("/api/health")).body.time);
});

test("Сводка содержит счётчики разделов", async () => {
  const { body } = await get("/api/overview");
  assert.equal(body.orders, 5);
  assert.equal(body.documents, 3);
  assert.equal(body.extensions, 4);
  assert.equal(body.slowQueries, 5);
});

test("Заказы содержат список и дефицит", async () => {
  const { body } = await get("/api/ut/orders");
  assert.equal(body.rows.length, 5);
  assert.equal(body.problems.length, 2);
  assert.equal(body.amount, 796650);
});

test("ОСВ сбалансирована", async () => {
  const { body } = await get("/api/bp/osv");
  assert.equal(body.balanced, true);
  assert.equal(body.delta, 0);
  assert.deepEqual(body.red, ["10"]);
});

test("Расчёт зарплаты содержит штат", async () => {
  const { body } = await get("/api/zup/payroll");
  assert.equal(body.rows.length, 6);
  assert.equal(body.fund, 632940);
});

test("Документы содержат просрочки", async () => {
  const { body } = await get("/api/do/documents");
  assert.equal(body.rows.length, 6);
  assert.equal(body.overdue, 4);
});

test("Обмены содержат карту и XML", async () => {
  const { body } = await get("/api/kd/exchange");
  assert.equal(body.rows.length, 5);
  assert.ok(body.sample.startsWith("<Object>"));
});

test("Журнал SOAP содержит конверт", async () => {
  const { body } = await get("/api/soap/log");
  assert.equal(body.total, 8);
  assert.ok(body.envelope.includes("soap:Envelope"));
});

test("Расширения содержат риск", async () => {
  const { body } = await get("/api/extensions");
  assert.equal(body.total, 6);
  assert.equal(body.high, 1);
});

test("Метрики отсортированы по времени", async () => {
  const { body } = await get("/api/db/metrics");
  assert.equal(body.rows[0].ExecMs, 2310);
  assert.equal(body.totalMs, 7808);
});

test("План резерва по обеспеченному заказу готов", async () => {
  const response = await fetch(`${base}/api/ut/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber: "УТ-00101" }),
  });
  const body = await response.json();
  assert.equal(body.ready, true);
  assert.deepEqual(body.gaps, []);
});

test("План резерва по дефицитному заказу не готов", async () => {
  const response = await fetch(`${base}/api/ut/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber: "УТ-00103" }),
  });
  const body = await response.json();
  assert.equal(body.ready, false);
  assert.equal(body.gaps.length, 1);
});

test("Неизвестный эндпоинт API отдаёт 404", async () => {
  const response = await fetch(`${base}/api/unknown`);
  assert.equal(response.status, 404);
});
