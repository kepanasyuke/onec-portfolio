import "dotenv/config";

export const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || "OnecPortfolio",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  connectionTimeout: 4000,
  requestTimeout: 8000,
};

export const apiPort = Number(process.env.API_PORT || 4000);
