const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

// 1. User Registration Handler
exports.register = (req, res) => {
    const { name, email, phone, password, diseases } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    User.findByEmail(email, (err, row) => {
        if (err) return res.status(500).json({ error: 'Database check failed.' });
        if (row) return res.status(400).json({ error: 'Email already registered.' });

        // Hash Password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Password hashing failed.' });

            User.create({ name, email, phone, password: hash, diseases }, (err, newUserId) => {
                if (err) return res.status(500).json({ error: 'Failed to create user.' });

                const token = jwt.sign({ id: newUserId, email }, JWT_SECRET, { expiresIn: '7d' });
                res.status(201).json({
                    message: 'Registration successful.',
                    token,
                    user: { id: newUserId, name, email, phone, diseases }
                });
            });
        });
    });
};

// 2. User Login Handler
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    User.findByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ error: 'Database lookup failed.' });
        if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Authentication failed.' });
            if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            res.json({
                message: 'Login successful.',
                token,
                user: { id: user.id, name: user.name, email: user.email, phone: user.phone, diseases: user.diseases }
            });
        });
    });
};

// 3. User Details Profile Handler
exports.me = (req, res) => {
    User.findById(req.user.id, (err, user) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve profile.' });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    });
};

// 4. Update Profile Info Handler
exports.updateProfile = (req, res) => {
    const { name, phone, password, diseases } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required.' });
    }

    const userId = req.user.id;

    if (password) {
        // Hash and Update password, name, phone, diseases
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Password hashing failed.' });

            User.update(userId, { name, phone, password: hash, diseases }, (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update credentials.' });
                res.json({ message: 'Profile and password updated successfully.' });
            });
        });
    } else {
        // Update name, phone, diseases only
        User.update(userId, { name, phone, diseases }, (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update details.' });
            res.json({ message: 'Profile updated successfully.' });
        });
    }
};
