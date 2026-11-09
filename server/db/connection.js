import sql from "mssql";
import { dbConfig } from "../config.js";

let poolPromise = null;

const softFail = (error) => {
  console.warn(`[db] MS SQL недоступен (${error.message}). Работаю на встроенном наборе данных.`);
  return null;
};

const connect = () => sql.connect(dbConfig).catch(softFail);

export const getPool = () => {
  poolPromise = poolPromise || connect();
  return poolPromise;
};

export const query = async (text) => {
  const pool = await getPool();
  return pool ? pool.request().query(text) : null;
};

export const execute = async (statement) => {
  const pool = await getPool();
  return pool ? pool.request().batch(statement) : null;
};
