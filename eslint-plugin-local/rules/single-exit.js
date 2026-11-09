const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

const isFunction = (node) => FUNCTION_TYPES.has(node.type);

const toList = (value) => (Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean));

const childrenOf = (node, visitorKeys) =>
  toList(visitorKeys[node.type]).flatMap((key) => toList(node[key]).filter((child) => child.type));

const walkOwn = (node, visitorKeys, onReturn) => {
  const descend = () => childrenOf(node, visitorKeys).forEach((child) => walkOwn(child, visitorKeys, onReturn));
  const collect = () => (node.type === "ReturnStatement" ? onReturn(node) : descend());
  return isFunction(node) ? undefined : collect();
};

const collectOwnReturns = (node, visitorKeys) => {
  const found = [];
  const onReturn = (statement) => found.push(statement);
  const block = node.body && node.body.type === "BlockStatement";
  return block ? walkOwn(node.body, visitorKeys, onReturn) || found : [];
};

export default {
  meta: {
    type: "problem",
    docs: { description: "Функция обязана иметь ровно один выход (return)" },
    schema: [],
    messages: {
      multipleExits:
        "Нарушен принцип единственного выхода: найден лишний return ({{count}}-й). Оставьте один return в конце функции.",
    },
  },
  create(context) {
    const visitorKeys = context.sourceCode.visitorKeys;
    const visit = (node) => {
      const returns = isFunction(node) ? collectOwnReturns(node, visitorKeys) : [];
      returns.slice(1).forEach((extra, index) =>
        context.report({ node: extra, messageId: "multipleExits", data: { count: index + 2 } }),
      );
    };
    return {
      FunctionDeclaration: visit,
      FunctionExpression: visit,
      ArrowFunctionExpression: visit,
    };
  },
};
