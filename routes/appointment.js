const express = require("express");
const router = express.Router();
const { bookAppointment, confirmAppointment} = require("../controllers/appointmentController");

router.post("/book", bookAppointment);
router.post("/confirm", confirmAppointment);

module.exports = router;
