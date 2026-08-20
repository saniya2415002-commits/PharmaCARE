const { supabase } = require('../config/db');

const User = {
    // Find user by email
    findByEmail: (email, callback) => {
        supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle()
            .then(({ data, error }) => {
                if (data) {
                    data.address = data.delivery_address || data.address || '';
                }
                callback(error, data || null);
            })
            .catch(err => callback(err, null));
    },

    // Find user by ID
    findById: (id, callback) => {
        supabase
            .from('users')
            .select('id, name, email, phone, delivery_address, diseases, created_at')
            .eq('id', id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (data) {
                    data.address = data.delivery_address || data.address || '';
                }
                callback(error, data || null);
            })
            .catch(err => callback(err, null));
    },

    // Register new user
    create: (userData, callback) => {
        const { name, email, phone, address, delivery_address, password, diseases } = userData;
        const addr = delivery_address || address || '';
        supabase
            .from('users')
            .insert([{ name, email, phone, delivery_address: addr, password, diseases: diseases || '' }])
            .select('id')
            .single()
            .then(({ data, error }) => {
                callback(error, data ? data.id : null);
            })
            .catch(err => callback(err, null));
    },

    // Update user details (name, phone, delivery_address, diseases, and optional password)
    update: (id, userData, callback) => {
        const { name, phone, address, delivery_address, password, diseases } = userData;
        const addr = delivery_address || address || '';
        const updateFields = { name, phone, delivery_address: addr, diseases: diseases || '' };
        if (password) {
            updateFields.password = password;
        }

        supabase
            .from('users')
            .update(updateFields)
            .eq('id', id)
            .then(({ error }) => {
                callback(error);
            })
            .catch(err => callback(err));
    }
};

module.exports = User;

