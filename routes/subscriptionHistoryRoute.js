
const express = require('express');
const router = express.Router();
const controller = require("../controllers/subscriptionHistoryController")

router.post("/createSubscriptionHistory" , controller.createSubscriptionHistory)
router.get("/getAllSubscriptionsHistory" , controller.getAllSubscriptionsHistories)
router.get("/getSubscriptionsHistoryById/:subscriptionHistoryId" , controller.getSubscriptionHistoryById)
router.delete("/deleteSubscriptionHistory/:subscriptionHistoryId" , controller.deleteSubscriptionHistory)
router.put("/updateSubscriptionHistory" , controller.updateSubscriptionHistory)
router.get("/getSubscriptionHistoryByUserId/:userId" , controller.getSubscriptionHistoryByUserId)


module.exports= router;