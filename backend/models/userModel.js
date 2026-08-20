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
            .select('*')
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
        
        const tryInsert = (payload) => {
            return supabase.from('users').insert([payload]).select('id').single();
        };

        tryInsert({ name, email, phone, delivery_address: addr, address: addr, password, diseases: diseases || '' })
            .then(({ data, error }) => {
                if (error) {
                    tryInsert({ name, email, phone, delivery_address: addr, password, diseases: diseases || '' })
                        .then(({ data: d2, error: e2 }) => {
                            if (e2) {
                                tryInsert({ name, email, phone, address: addr, password, diseases: diseases || '' })
                                    .then(({ data: d3, error: e3 }) => {
                                        if (e3) {
                                            tryInsert({ name, email, phone, password, diseases: diseases || '' })
                                                .then(({ data: d4, error: e4 }) => {
                                                    callback(e4, d4 ? d4.id : null);
                                                });
                                        } else {
                                            callback(null, d3 ? d3.id : null);
                                        }
                                    });
                            } else {
                                callback(null, d2 ? d2.id : null);
                            }
                        });
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
        const updateFields = { name, phone, delivery_address: addr, address: addr, diseases: diseases || '' };
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
                    supabase.from('users').update(updateFields).eq('id', id)
                        .then(({ error: e2 }) => {
                            if (e2) {
                                delete updateFields.delivery_address;
                                updateFields.address = addr;
                                supabase.from('users').update(updateFields).eq('id', id)
                                    .then(({ error: e3 }) => callback(e3));
                            } else {
                                callback(null);
                            }
                        });
                } else {
                    callback(null);
                }
            })
            .catch(err => callback(err));
    }
};

module.exports = User;

