const { Router } = require("express");
const router = Router();

const { create, get, destroy } = require("../controller/mBarang");

router.post("/create", create);
router.get("/get", get);
router.delete("/delete/:id", destroy);

module.exports = router;
