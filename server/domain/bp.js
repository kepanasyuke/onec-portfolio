const closingDt = (account) => account.OpenDt + account.TurnDt - account.TurnKt;

const closingKt = (account) => account.OpenKt + account.TurnKt - account.TurnDt;

const isActive = (account) => account.Kind === "Активный";

const balance = (account) => (isActive(account) ? closingDt(account) : closingKt(account));

const isRed = (account) => balance(account) < 0;

const withBalances = (account) =>
  Object.assign({}, account, { closingDt: closingDt(account), closingKt: closingKt(account), balance: balance(account), red: isRed(account) });

const sumBy = (selector) => (rows) => rows.reduce((sum, row) => sum + selector(row), 0);

const turnoverDt = (account) => account.TurnDt;

const turnoverKt = (account) => account.TurnKt;

export const buildOsv = (accounts) => {
  const totals = { debit: sumBy(turnoverDt)(accounts), credit: sumBy(turnoverKt)(accounts) };
  return {
    rows: accounts.map(withBalances),
    totals,
    balanced: totals.debit === totals.credit,
    delta: totals.debit - totals.credit,
    red: accounts.filter(isRed).map((account) => account.Code),
  };
};

export const redSaldo = (accounts) => buildOsv(accounts).rows.filter((row) => row.red);
