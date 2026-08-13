const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Orders endpoints
router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', requireAuth, orderController.getMyOrders);

module.exports = router;
