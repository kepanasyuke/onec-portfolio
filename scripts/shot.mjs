import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9337;
const ROOT = "C:\\Users\\Admin\\Documents\\MultiTool\\HomeChats\\Chat-134";
const OUT = path.join(ROOT, "docs", "screens");
const BASE = "http://127.0.0.1:4000";
const WIDTH = 1600;
const HEIGHT = 1150;

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url) => (await fetch(url)).json();

const waitForBrowser = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      return await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error("браузер не запустился");
};

const launch = () =>
  spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${path.join(process.env.TEMP, "cdp-shots")}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

const openSession = async () => {
  const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const page = list.find((item) => item.type === "page");
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let nextId = 1;
  const pending = new Map();
  const events = [];
  socket.onmessage = (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const entry = pending.get(payload.id);
      pending.delete(payload.id);
      payload.error ? entry.reject(new Error(payload.error.message)) : entry.resolve(payload.result);
      return;
    }
    payload.method && events.push(payload);
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId;
      nextId += 1;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  return { send, events, socket };
};

const consoleErrors = (events) =>
  events
    .filter((event) => event.method === "Runtime.exceptionThrown" || event.method === "Runtime.consoleAPICalled")
    .map((event) => {
      const details = event.params.exceptionDetails;
      return details ? `${details.text} ${details.exception?.description || ""}` : JSON.stringify(event.params.args?.map((arg) => arg.value));
    });

const shoot = async (session, route, name) => {
  session.events.length = 0;
  await session.send("Page.navigate", { url: `${BASE}/#${route}` });
  await sleep(2600);
  const probe = await session.send("Runtime.evaluate", {
    expression: 'JSON.stringify({ len: document.getElementById("root").innerHTML.length, tables: document.querySelectorAll("table").length })',
    returnByValue: true,
  });
  const shot = await session.send("Page.captureScreenshot", { format: "png" });
  const file = path.join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(shot.data, "base64"));
  return { name, info: probe.result.value, errors: consoleErrors(session.events) };
};

mkdirSync(OUT, { recursive: true });

const browser = launch();

try {
  await waitForBrowser();
  const session = await openSession();
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const [route, name] of ROUTES) {
    const result = await shoot(session, route, name);
    console.log(`${result.name}: ${result.info}`);
    result.errors.forEach((error) => console.log(`   ! ${error}`));
  }
  session.socket.close();
} finally {
  browser.kill();
}
