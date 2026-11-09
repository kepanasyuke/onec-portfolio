import singleExit from "./rules/single-exit.js";
import jsxUsesVars from "./rules/jsx-uses-vars.js";

export default {
  meta: { name: "eslint-plugin-local", version: "1.0.0" },
  rules: { "single-exit": singleExit, "jsx-uses-vars": jsxUsesVars },
};
