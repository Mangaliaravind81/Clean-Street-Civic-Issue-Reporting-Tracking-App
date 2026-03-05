const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zone");

router.post("/", zoneController.createZone);
router.get("/", zoneController.getZones);
router.put("/:id", zoneController.updateZone);
router.delete("/:id", zoneController.deleteZone);

module.exports = router;
