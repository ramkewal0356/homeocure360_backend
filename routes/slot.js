const { createSlot, getSlotByDoctorId, bookSlot } = require('../controllers/slotController');

const router= require('express').Router();
router.post('/:doctorId/slots',createSlot);
router.get('/:doctorId/slots',getSlotByDoctorId);
router.post('/book',bookSlot);
module.exports= router;