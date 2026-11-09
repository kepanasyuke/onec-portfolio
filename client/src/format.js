const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

const plain = new Intl.NumberFormat("ru-RU");

export const money = (value) => `${rub.format(Math.round(value))} ₽`;

export const num = (value) => plain.format(value);

export const percent = (value) => `${plain.format(Math.round(value * 10) / 10)} %`;

export const ms = (value) => `${plain.format(value)} мс`;
