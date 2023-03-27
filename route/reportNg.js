const { Router } = require("express");
const router = Router();

const { create, get, destroy, exportExcel } = require("../controller/reportNg");

router.post("/create", create);
router.get("/get", get);
router.delete("/delete/:id", destroy);
router.post("/export", exportExcel);

module.exports = router;
