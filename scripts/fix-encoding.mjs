import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = "C:\\Users\\Admin\\Documents\\MultiTool\\HomeChats\\Chat-134\\client\\src";
const MARKERS = ["Рџ", "Рѕ", "С‚", "СЃ", "вЂ", "РЎ"];

const decoder = new TextDecoder("windows-1251");

const byteOf = new Map();

for (let code = 0; code < 256; code += 1) {
  byteOf.set(decoder.decode(Uint8Array.of(code)), code);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const looksBroken = (text) => MARKERS.some((marker) => text.includes(marker));

const stripBom = (text) => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

const repair = (text) => {
  const bytes = [];
  const missing = [];
  for (const char of text) {
    const byte = byteOf.get(char);
    if (byte === undefined) {
      missing.push(char);
      continue;
    }
    bytes.push(byte);
  }
  if (missing.length) {
    console.log(`  неизвестные символы: ${[...new Set(missing)].map((char) => `${char}(${char.codePointAt(0).toString(16)})`).join(", ")}`);
    return null;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(Uint8Array.from(bytes));
};

const files = walk(ROOT).filter((file) => /\.(js|jsx|css)$/.test(file));

let fixed = 0;

for (const file of files) {
  const text = stripBom(readFileSync(file, "utf8"));
  if (!looksBroken(text)) continue;
  const repaired = repair(text);
  if (!repaired) {
    console.log(`ПРОПУСК (не чистый cp1251): ${path.relative(ROOT, file)}`);
    continue;
  }
  writeFileSync(file, stripBom(repaired), "utf8");
  fixed += 1;
  console.log(`исправлен: ${path.relative(ROOT, file)}`);
}

console.log(`итого исправлено: ${fixed}`);
