const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Bookings endpoints
router.post('/', authenticateToken, bookingController.createBooking);
router.get('/my-bookings', requireAuth, bookingController.getMyBookings);
router.put('/:id/cancel', requireAuth, bookingController.cancelBooking);

module.exports = router;
