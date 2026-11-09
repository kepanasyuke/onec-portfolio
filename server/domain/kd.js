const splitPair = (pair) => pair.split("→").map((part) => part.trim());

export const parseFields = (fields) => fields.split(";").map(splitPair);

const quality = (rule) => Math.round((1 - rule.Issues / rule.Objects) * 1000) / 10;

const statusOf = (rule) => (rule.Issues === 0 ? "Готово" : rule.Issues < 3 ? "Проверить" : "Доработка");

const decorate = (rule) => Object.assign({}, rule, { map: parseFields(rule.Fields), quality: quality(rule), status: statusOf(rule) });

export const buildRules = (rules) => rules.map(decorate);

const xmlValue = (pair, source) => `<${pair[1]}>${source[pair[0]] || ""}</${pair[1]}>`;

export const toXml = (rule, source) => `<Object><Type>${rule.Target}</Type>${parseFields(rule.Fields).map((pair) => xmlValue(pair, source)).join("")}</Object>`;

const sample = () => ({ Номер: "УТ-00101", Дата: "2026-11-08", СуммаДокумента: 128400 });

export const exchangeSummary = (rules) => {
  const rows = buildRules(rules);
  return {
    rows,
    objects: rows.reduce((sum, rule) => sum + rule.Objects, 0),
    issues: rows.reduce((sum, rule) => sum + rule.Issues, 0),
    sample: rows.length ? toXml(rows[0], sample()) : "",
  };
};
