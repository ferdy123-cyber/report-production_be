const { Router } = require("express");
const router = Router();

const { get } = require("../controller/reportExcel");

router.get("/get", get);

module.exports = router;
