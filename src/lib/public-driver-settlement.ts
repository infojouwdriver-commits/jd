export const settlementPlatforms = ['Uber', 'Bolt', 'Heetch', 'Taximètre'] as const;
export type SettlementForm = {
  driver: string;
  rows: { income: string; cash: string }[];
  share: string;
  fuel: string;
  fuelShare: string;
  expenses: string;
};

export function emptySettlement(): SettlementForm {
  return {
    driver: '', rows: settlementPlatforms.map(() => ({ income: '', cash: '' })),
    share: '50', fuel: '', fuelShare: '50', expenses: '',
  };
}

function cents(input: string, max = 99999999999) {
  const cleaned = input.trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٫,]/g, '.');
  if (!/^\d{0,9}(?:\.\d{0,2})?$/.test(cleaned)) return NaN;
  const value = Math.round(Number(cleaned) * 100);
  return value <= max ? value : NaN;
}

export function calculateSettlement(form: SettlementForm) {
  const rows = settlementPlatforms.map((platform, i) => ({
    platform, income: cents(form.rows[i].income), cash: cents(form.rows[i].cash),
  }));
  const income = rows.reduce((total, row) => total + row.income, 0);
  const cash = rows.reduce((total, row) => total + row.cash, 0);
  const share = cents(form.share, 10000);
  const fuelShare = cents(form.fuelShare, 10000);
  const fuel = cents(form.fuel);
  const expenses = cents(form.expenses);
  const gross = Math.round(income * share / 10000);
  const driverFuel = Math.round(fuel * fuelShare / 10000);
  const companyFuel = fuel - driverFuel;
  const balance = gross - cash - driverFuel - expenses;
  return {
    rows, income, cash, share, fuelShare, fuel, expenses, gross, driverFuel, companyFuel, balance,
    invalid: ![income, cash, share, fuelShare, fuel, expenses].every(Number.isFinite),
    excessCash: rows.filter((row) => row.cash > row.income).map((row) => row.platform),
  };
}
