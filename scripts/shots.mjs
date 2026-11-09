import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = "C:\\Users\\Admin\\Documents\\MultiTool\\HomeChats\\Chat-134";
const NODE = "C:\\Program Files\\nodejs\\node.exe";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = path.join(ROOT, "docs", "screens");
const BASE = "http://127.0.0.1:4000";

const ROUTES = [
  ["overview", "01-overview"],
  ["ut", "02-ut"],
  ["bp", "03-bp"],
  ["zup", "04-zup"],
  ["do", "05-do"],
  ["kd", "06-kd"],
  ["soap", "07-soap"],
  ["ext", "08-ext"],
  ["db", "09-db"],
];

const ready = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return true;
    } catch {
      await sleep(400);
    }
  }
  return false;
};

const shoot = (route, file) => {
  const profile = path.join(process.env.TEMP, `gt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profile}`,
      "--window-size=1600,1150",
      "--virtual-time-budget=7000",
      `--screenshot=${file}`,
      `${BASE}/#${route}`,
    ],
    { stdio: "ignore", timeout: 90000 },
  );
};

mkdirSync(OUT, { recursive: true });

const server = spawn(NODE, ["server/index.js"], { cwd: ROOT, stdio: "ignore" });

try {
  const up = await ready();
  console.log(`сервер: ${up ? "запущен" : "НЕ ЗАПУСТИЛСЯ"}`);
  for (const [route, name] of ROUTES) {
    const file = path.join(OUT, `${name}.png`);
    shoot(route, file);
    const size = existsSync(file) ? Math.round(statSync(file).size / 1024) : 0;
    console.log(`${name}: ${size ? `${size} КБ` : "FAIL"}`);
  }
} finally {
  server.kill();
}
