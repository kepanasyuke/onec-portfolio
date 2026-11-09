import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes/api.js";

const root = path.dirname(fileURLToPath(import.meta.url));

const dist = path.join(root, "..", "dist");

const withCors = (app) => app.use(cors());

const withJson = (app) => app.use(express.json());

const withApi = (app) => app.use("/api", router);

const withApiNotFound = (app) => app.use("/api", (_req, res) => res.status(404).json({ error: "Эндпоинт не найден" }));

const withStatic = (app) => app.use(express.static(dist));

const withFallback = (app) => app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));

const mount = (app, parts) => {
  parts.forEach((part) => part(app));
  return app;
};

export const createApp = () => mount(express(), [withCors, withJson, withApi, withApiNotFound, withStatic, withFallback]);
