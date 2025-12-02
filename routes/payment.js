const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const paymentCtrl = require('../controllers/paymentController');

// router.use(authMiddleware('doctor'));

router.post('/create-order', paymentCtrl.createOrder);
router.post('/verify-payment', paymentCtrl.verifyPayment);
router.post("/save-temp", paymentCtrl.saveTempData);

module.exports = router;
