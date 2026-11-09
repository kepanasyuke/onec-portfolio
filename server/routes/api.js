import { Router } from "express";
import { getStore } from "../db/store.js";
import { ordersSummary, buildReservePlan } from "../domain/ut.js";
import { buildOsv } from "../domain/bp.js";
import { payrollSummary } from "../domain/zup.js";
import { buildDocuments } from "../domain/do.js";
import { exchangeSummary } from "../domain/kd.js";
import { buildLog, sampleEnvelope } from "../domain/soap.js";
import { buildExtensions } from "../domain/extensions.js";
import { buildMetrics } from "../domain/dbmetrics.js";

const respond = (res) => (payload) => res.json(payload);

const handler = (compute) => async (_req, res) => respond(res)(compute(await getStore()));

const withBody = (compute) => async (req, res) => respond(res)(compute(await getStore(), req.body));

const overview = (store) => ({
  orders: ordersSummary(store).count,
  documents: buildDocuments(store.Documents).active,
  extensions: buildExtensions(store.Extensions).enabled,
  slowQueries: buildMetrics(store.QueryMetrics).slow,
});

const router = Router();

router.get("/health", (_req, res) => respond(res)({ status: "ok", time: new Date().toISOString() }));
router.get("/overview", handler(overview));
router.get("/ut/orders", handler((store) => ordersSummary(store)));
router.post("/ut/reserve", withBody((store, body) => buildReservePlan(store)(body.orderNumber)));
router.get("/bp/osv", handler((store) => buildOsv(store.Accounts)));
router.get("/zup/payroll", handler((store) => payrollSummary(store.Employees)));
router.get("/do/documents", handler((store) => buildDocuments(store.Documents)));
router.get("/kd/exchange", handler((store) => exchangeSummary(store.ExchangeRules)));
router.get("/soap/log", handler((store) => Object.assign({}, buildLog(store.IntegrationLog), { envelope: sampleEnvelope() })));
router.get("/extensions", handler((store) => buildExtensions(store.Extensions)));
router.get("/db/metrics", handler((store) => buildMetrics(store.QueryMetrics)));

export default router;
