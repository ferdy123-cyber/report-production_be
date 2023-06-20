const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "10000mb" }));
app.use(express.json({ limit: "10000mb" }));

const authRoute = require("./route/auth");
const mBarangRoute = require("./route/mBarang");
const mDefectRoute = require("./route/mDefect");
const reportOk = require("./route/reportOk");
const reportNg = require("./route/reportNg");
const reportExcel = require("./route/reportExcel");

app.use("/auth", authRoute);
app.use("/mBarang", mBarangRoute);
app.use("/mDefect", mDefectRoute);
app.use("/reportOk", reportOk);
app.use("/reportNg", reportNg);
app.use("/reportExcel", reportExcel);

app.use((error, req, res, next) => {
  return res.status(400).send({
    status: "error",
    code: 500,
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
