const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createSubscription, verifyPayment } = require('../controllers/paymentController');

router.use(authMiddleware('doctor'));

router.post('/create-subscription', createSubscription);
router.post('/verify', verifyPayment);

module.exports = router;
