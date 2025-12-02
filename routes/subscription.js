const express = require("express");
const router = express.Router();
const { createSubscription, activateSubscription } = require("../controllers/subscriptionController");

router.post("/create", createSubscription);
router.post("/activate", activateSubscription);

module.exports = router;