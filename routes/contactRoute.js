const express = require('express');
const router = express.Router();
const controller = require("../controllers/contactController")

router.post("/contact" , controller.contact)
router.get("/getAllContactMessages" , controller.getAllContactMessage)
router.get("/getContactMessagesByEmail" , controller.getContactMessagesByUserEmail)
router.put("/updateContactMessage", controller.updateContactMessage)
router.delete("/deleteContactMessage/:contactMessageId", controller.deleteContactMessage)

module.exports= router;