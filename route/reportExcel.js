const { Router } = require("express");
const router = Router();

const { get, exportExcel } = require("../controller/reportExcel");

router.get("/get", get);
router.get("/exportExcel", exportExcel);

module.exports = router;
