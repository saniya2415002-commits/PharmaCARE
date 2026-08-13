const { supabase } = require('../config/db');

const Booking = {
    // Create an appointment booking
    create: (bookingData, callback) => {
        const { user_id, patient_name, phone, email, date, doctor, time_slot } = bookingData;
        supabase
            .from('bookings')
            .insert([{
                user_id: user_id || null,
                patient_name,
                phone,
                email: email || '',
                date,
                doctor,
                time_slot,
                status: 'confirmed'
            }])
            .select('id')
            .single()
            .then(({ data, error }) => {
                callback(error, data ? data.id : null);
            })
            .catch(err => callback(err, null));
    },

    // Retrieve appointments for a specific user ID
    findByUserId: (userId, callback) => {
        supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                callback(error, data || []);
            })
            .catch(err => callback(err, []));
    },

    // Update appointment booking status to 'Cancelled'
    cancel: (id, userId, callback) => {
        supabase
            .from('bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .eq('user_id', userId)
            .select('id')
            .then(({ data, error }) => {
                const count = data ? (Array.isArray(data) ? data.length : 1) : 0;
                callback(error, count);
            })
            .catch(err => callback(err, 0));
    }
};

module.exports = Booking;

