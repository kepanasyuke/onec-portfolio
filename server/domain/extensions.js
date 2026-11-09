const parts = (version) => version.split(".").map(Number);

const cmp = (left, right) => (left === right ? 0 : left > right ? 1 : -1);

const compareVersions = (left, right) =>
  parts(left).reduce((acc, part, index) => acc || cmp(part, parts(right)[index] || 0), 0);

const riskOf = (extension) => {
  const outdated = compareVersions(extension.Compatible, extension.Config.split(" ").at(-1)) < 0;
  return outdated ? "Высокий" : extension.Enabled ? "Низкий" : "Средний";
};

const decorate = (extension) => Object.assign({}, extension, { risk: riskOf(extension) });

export const buildExtensions = (extensions) => ({
  rows: extensions.map(decorate),
  total: extensions.length,
  enabled: extensions.filter((extension) => extension.Enabled).length,
  objects: extensions.reduce((sum, extension) => sum + extension.Objects, 0),
  high: extensions.map(decorate).filter((extension) => extension.risk === "Высокий").length,
});
