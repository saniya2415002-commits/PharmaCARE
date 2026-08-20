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
                    const addr = data.delivery_address || data.address || data["delivery address"] || '';
                    data.address = addr;
                    data.delivery_address = addr;
                }
                callback(error, data || null);
            })
            .catch(err => callback(err, null));
    },

    // Find user by ID
    findById: (id, callback) => {
        supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (data) {
                    const addr = data.delivery_address || data.address || data["delivery address"] || '';
                    data.address = addr;
                    data.delivery_address = addr;
                }
                callback(error, data || null);
            })
            .catch(err => callback(err, null));
    },

    // Register new user
    create: (userData, callback) => {
        const { name, email, phone, address, delivery_address, password, diseases } = userData;
        const addr = delivery_address || address || '';

        const payload = {
            name,
            email,
            phone,
            delivery_address: addr,
            address: addr,
            password,
            diseases: diseases || ''
        };

        supabase
            .from('users')
            .insert([payload])
            .select('id')
            .single()
            .then(({ data, error }) => {
                if (error) {
                    // Fallback: Retry with single address column
                    delete payload.address;
                    supabase
                        .from('users')
                        .insert([payload])
                        .select('id')
                        .single()
                        .then(({ data: d2, error: e2 }) => {
                            callback(e2, d2 ? d2.id : null);
                        })
                        .catch(err2 => callback(err2, null));
                } else {
                    callback(null, data ? data.id : null);
                }
            })
            .catch(err => callback(err, null));
    },

    // Update user details
    update: (id, userData, callback) => {
        const { name, phone, address, delivery_address, password, diseases } = userData;
        const addr = delivery_address || address || '';
        const updateFields = {
            name,
            phone,
            delivery_address: addr,
            address: addr,
            diseases: diseases || ''
        };
        if (password) {
            updateFields.password = password;
        }

        supabase
            .from('users')
            .update(updateFields)
            .eq('id', id)
            .then(({ error }) => {
                if (error) {
                    delete updateFields.address;
                    supabase
                        .from('users')
                        .update(updateFields)
                        .eq('id', id)
                        .then(({ error: e2 }) => callback(e2))
                        .catch(err2 => callback(err2));
                } else {
                    callback(null);
                }
            })
            .catch(err => callback(err));
    }
};

module.exports = User;

