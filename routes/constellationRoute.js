const express = require('express');
const router = express.Router();
const controller = require("../controllers/constellationController")

router.post("/createConstellation" , controller.createConstellation)
router.get("/getAllConstellations" , controller.getAllConstellation)
router.get("/getConstellationById" , controller.getConstellationById)
router.put("/updateConstellation", controller.updateConstellation)
router.delete("/deleteConstellation/:constellationId", controller.deleteConstellation)

module.exports= router;