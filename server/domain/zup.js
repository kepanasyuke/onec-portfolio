const BRACKETS = [
  { limit: 2400000, rate: 0.13 },
  { limit: 5000000, rate: 0.15 },
  { limit: 20000000, rate: 0.18 },
  { limit: 50000000, rate: 0.2 },
  { limit: Number.POSITIVE_INFINITY, rate: 0.22 },
];

const CONTRIBUTION_LIMIT = 2225000;

const tier = (base) => (state, bracket) => {
  const used = Math.min(base, bracket.limit);
  return { tax: state.tax + Math.max(0, used - state.used) * bracket.rate, used };
};

export const ndfl = (base) => Math.round(BRACKETS.reduce(tier(base), { tax: 0, used: 0 }).tax);

export const contributions = (base) =>
  Math.round(Math.min(base, CONTRIBUTION_LIMIT) * 0.3 + Math.max(0, base - CONTRIBUTION_LIMIT) * 0.151);

const premium = (employee) => Math.round((employee.Salary * (employee.KpiPercent - 100)) / 100);

const grossOf = (employee) => employee.Salary + premium(employee);

const monthlyTax = (gross) => Math.round(ndfl(gross * 12) / 12);

const monthlyContributions = (gross) => Math.round(contributions(gross * 12) / 12);

const row = (employee) => (gross) =>
  Object.assign({}, employee, { premium: premium(employee), gross, ndfl: monthlyTax(gross), net: gross - monthlyTax(gross), contributions: monthlyContributions(gross) });

export const payroll = (employees) => employees.map((employee) => row(employee)(grossOf(employee)));

const sumBy = (selector) => (rows) => rows.reduce((sum, item) => sum + selector(item), 0);

export const payrollSummary = (employees) => {
  const rows = payroll(employees);
  return { rows, fund: sumBy((item) => item.gross)(rows), tax: sumBy((item) => item.ndfl)(rows), contributions: sumBy((item) => item.contributions)(rows) };
};
