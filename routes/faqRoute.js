const express = require('express');
const router = express.Router();
const controller = require("../controllers/faqsController")

router.post("/createFaq" , controller.createFaq)
router.get("/getAllFaqs" , controller.getAllFaqs)
router.get("/getFaqById" , controller.getFaqById)
router.put("/updateFaq", controller.updateFaq)
router.delete("/deleteFaq/:faqId", controller.deleteFaq)

module.exports= router;