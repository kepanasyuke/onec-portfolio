const isComponentName = (name) => typeof name === "string" && /^[A-Z]/.test(name);

export default {
  meta: {
    type: "problem",
    docs: { description: "Помечает переменные, использованные в JSX, как использованные" },
    schema: [],
  },
  create(context) {
    const markName = (nameNode) => {
      const name = nameNode && nameNode.name;
      isComponentName(name) && context.sourceCode.markVariableAsUsed(name, nameNode);
    };
    const visitName = (name) => {
      const isMember = name.type === "JSXMemberExpression";
      isMember ? markName(name.object) : markName(name);
    };
    return { JSXOpeningElement: (node) => visitName(node.name) };
  },
};
