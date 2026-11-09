const SLA = {
  "Юридический отдел": 24,
  "Финансовый отдел": 48,
  Снабжение: 8,
  "Проверка сумм": 4,
  Завершён: 0,
  "Не отправлен": 0,
};

const norm = (document) => SLA[document.Step] ?? 24;

const isOverdue = (document) => norm(document) > 0 && document.Hours > norm(document);

const decorate = (document) =>
  Object.assign({}, document, { norm: norm(document), overdue: isOverdue(document), remaining: Math.max(0, norm(document) - document.Hours) });

const ACTIVE = ["На согласовании"];

const isActive = (document) => ACTIVE.includes(document.Status);

export const buildDocuments = (documents) => ({
  rows: documents.map(decorate),
  overdue: documents.filter(isOverdue).length,
  active: documents.filter(isActive).length,
  totalHours: documents.reduce((sum, document) => sum + document.Hours, 0),
});

export const routes = (documents) =>
  documents.reduce((acc, document) => (acc.includes(document.Step) ? acc : acc.concat(document.Step)), []);
