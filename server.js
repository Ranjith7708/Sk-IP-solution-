const path = require("path");
const express = require("express");
const cors = require("cors");
const initSqlJs = require("sql.js");

const app = express();
app.use(cors());
app.use(express.json());

let db;

app.get("/", (req, res) => {
  res.send("SK IP Solution API is running 🚀");
});

// Explicitly locate the sql.js WASM binary (same dir as the resolved module)
const wasmPath = path.join(
  path.dirname(require.resolve("sql.js")),
  "sql-wasm.wasm"
);

initSqlJs({ locateFile: () => wasmPath })
  .then(SQL => {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        code TEXT
      )
    `);

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch(err => {
    console.error("sql.js init failed:", err);
    process.exit(1);
  });