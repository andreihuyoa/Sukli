import "dotenv/config";
import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 4000);

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "suki",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "up" });
  } catch {
    res.status(503).json({ ok: false, db: "down" });
  }
});

app.listen(port, () => {
  console.log(`@suki/backend listening on :${port}`);
});
