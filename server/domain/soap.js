const NS = "http://www.example.ru/erp/integration";

export const buildEnvelope = (service, operation, payload) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:erp="${NS}">`,
    "  <soap:Header>",
    `    <erp:Auth><erp:Service>${service}</erp:Service></erp:Auth>`,
    "  </soap:Header>",
    "  <soap:Body>",
    `    <erp:${operation}>${payload}</erp:${operation}>`,
    "  </soap:Body>",
    "</soap:Envelope>",
  ].join("\n");

const isSuccess = (entry) => entry.Status === "Успех";

const slowest = (entries) => entries.reduce((max, entry) => (entry.DurationMs > max ? entry.DurationMs : max), 0);

const avg = (entries) => Math.round(entries.reduce((sum, entry) => sum + entry.DurationMs, 0) / entries.length);

export const buildLog = (entries) => ({
  rows: entries,
  total: entries.length,
  success: entries.filter(isSuccess).length,
  failed: entries.filter((entry) => !isSuccess(entry)).length,
  avgMs: entries.length ? avg(entries) : 0,
  maxMs: entries.length ? slowest(entries) : 0,
});

export const sampleEnvelope = () =>
  buildEnvelope("CRM.Sync", "GetOrders", "<erp:DateFrom>2026-11-01</erp:DateFrom><erp:DateTo>2026-11-08</erp:DateTo>");
