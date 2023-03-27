var mysql = require("mysql2");

// const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASS, DB_DIALECT, DB_LOGGING } =
//   process.env;

// console.log(DB_HOST);

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "report_production",
  waitForConnections: true,
  connectionLimit: 36,
  queueLimit: 0,
};

const db = new mysql.createPool(config);

module.exports = db;
