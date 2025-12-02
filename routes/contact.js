const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {createContact, getAllMessage}= require('../controllers/contactController');

router.post('/create-contact',createContact);
router.get('/getAllMessage',authMiddleware('admin'),getAllMessage);
module.exports= router;
