const Booking = require('../models/bookingModel');

// 1. Create Appointment Booking Controller
exports.createBooking = (req, res) => {
    const { patient_name, phone, email, date, doctor, time_slot } = req.body;

    if (!patient_name || !phone || !date || !doctor || !time_slot) {
        return res.status(400).json({ error: 'Required booking parameters missing.' });
    }

    const user_id = req.user ? req.user.id : null;

    Booking.create({
        user_id,
        patient_name,
        phone,
        email,
        date,
        doctor,
        time_slot
    }, (err, newBookingId) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save booking appointment.' });
        }
        res.status(201).json({
            message: 'Appointment booked successfully.',
            bookingId: newBookingId
        });
    });
};

// 2. Retrieve User Appointments Controller
exports.getMyBookings = (req, res) => {
    Booking.findByUserId(req.user.id, (err, bookings) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch bookings.' });
        res.json({ bookings });
    });
};

// 3. Cancel Appointment Booking Controller
exports.cancelBooking = (req, res) => {
    const bookingId = req.params.id;
    const userId = req.user.id;

    Booking.cancel(bookingId, userId, (err, changes) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to cancel appointment.' });
        }
        if (changes === 0) {
            return res.status(404).json({ error: 'Appointment not found or unauthorized.' });
        }
        res.json({ message: 'Appointment cancelled successfully.' });
    });
};

