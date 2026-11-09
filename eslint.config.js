import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import local from "./eslint-plugin-local/index.js";

const forbiddenSyntax = [
  ["ForStatement", "Р¦РёРєР»С‹ for Р·Р°РїСЂРµС‰РµРЅС‹. РСЃРїРѕР»СЊР·СѓР№С‚Рµ map / filter / reduce РёР»Рё СЂРµРєСѓСЂСЃРёСЋ."],
  ["ForInStatement", "Р¦РёРєР»С‹ for-in Р·Р°РїСЂРµС‰РµРЅС‹. РСЃРїРѕР»СЊР·СѓР№С‚Рµ Object.keys / Object.entries."],
  ["ForOfStatement", "Р¦РёРєР»С‹ for-of Р·Р°РїСЂРµС‰РµРЅС‹. РСЃРїРѕР»СЊР·СѓР№С‚Рµ map / filter / reduce РёР»Рё СЂРµРєСѓСЂСЃРёСЋ."],
  ["WhileStatement", "Р¦РёРєР» while Р·Р°РїСЂРµС‰С‘РЅ. РСЃРїРѕР»СЊР·СѓР№С‚Рµ СЂРµРєСѓСЂСЃРёСЋ РёР»Рё РјРµС‚РѕРґС‹ РјР°СЃСЃРёРІР°."],
  ["DoWhileStatement", "Р¦РёРєР» do-while Р·Р°РїСЂРµС‰С‘РЅ. РСЃРїРѕР»СЊР·СѓР№С‚Рµ СЂРµРєСѓСЂСЃРёСЋ РёР»Рё РјРµС‚РѕРґС‹ РјР°СЃСЃРёРІР°."],
  ["BreakStatement", "break Р·Р°РїСЂРµС‰С‘РЅ: РѕРЅ РґРµР»Р°РµС‚ РІС‚РѕСЂРѕР№ РІС‹С…РѕРґ РёР· РєРѕРЅСЃС‚СЂСѓРєС†РёРё."],
  ["ContinueStatement", "continue Р·Р°РїСЂРµС‰С‘РЅ: РёСЃРїРѕР»СЊР·СѓР№С‚Рµ filter."],
  ["LabeledStatement", "РњРµС‚РєРё Рё РїРµСЂРµС…РѕРґС‹ Р·Р°РїСЂРµС‰РµРЅС‹."],
].map(([selector, message]) => ({ selector, message }));

const codeRules = {
  "local/single-exit": "error",
  "local/jsx-uses-vars": "error",
  "max-statements": ["error", 2],
  "max-depth": ["error", 1],
  "max-params": ["error", 3],
  complexity: ["error", 3],
  "no-restricted-syntax": ["error", ...forbiddenSyntax],
  "no-else-return": "off",
  "consistent-return": "off",
  "no-ternary": "off",
  "no-var": "error",
  "prefer-const": "error",
  eqeqeq: ["error", "always"],
  "no-plusplus": "error",
  "no-param-reassign": "error",
  "no-throw-literal": "error",
  "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "no-console": ["warn", { allow: ["error", "warn"] }],
  "prefer-arrow-callback": "error",
};

const jsFiles = {
  files: ["server/**/*.js", "client/src/**/*.{js,jsx}"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
    globals: { ...globals.node, ...globals.browser },
  },
  plugins: { local, "react-hooks": reactHooks },
  rules: { ...js.configs.recommended.rules, ...codeRules, ...reactHooks.configs["recommended-latest"].rules },
};

const toolingFiles = {
  files: ["eslint-plugin-local/**/*.js", "*.config.js", "vite.config.js"],
  languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.node } },
  rules: { ...js.configs.recommended.rules },
};

const scriptFiles = {
  files: ["server/db/init.js"],
  rules: { "no-console": "off" },
};

const testFiles = {
  files: ["tests/**/*.js"],
  languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.node } },
  rules: { ...js.configs.recommended.rules },
};

export default [
  { ignores: ["node_modules/**", "dist/**", "client/dist/**"] },
  toolingFiles,
  jsFiles,
  scriptFiles,
  testFiles,
];
