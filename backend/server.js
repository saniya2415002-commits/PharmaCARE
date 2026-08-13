const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database connection
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Route Bindings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Serve Static Frontend Assets (mapped to relocated frontend folder)
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route to serve index.html for all other entries
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
