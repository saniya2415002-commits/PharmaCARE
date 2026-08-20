const { supabase } = require('../config/db');

const Order = {
    // Create an order checkout record
    create: (orderData, callback) => {
        const { user_id, items, total, status, address, delivery_address } = orderData;
        const addr = delivery_address || address || '';
        let itemsJson = items;
        if (typeof items === 'string') {
            try {
                itemsJson = JSON.parse(items);
            } catch (e) {
                itemsJson = items;
            }
        }
        
        const payload = {
            user_id: user_id || null,
            items: itemsJson,
            total: total,
            delivery_address: addr,
            address: addr,
            status: status || 'shipped'
        };

        supabase
            .from('orders')
            .insert([payload])
            .select('id')
            .single()
            .then(({ data, error }) => {
                if (error) {
                    delete payload.address;
                    supabase
                        .from('orders')
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

    // Retrieve order checkouts for a user ID
    findByUserId: (userId, callback) => {
        supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                callback(error, data || []);
            })
            .catch(err => callback(err, []));
    }
};

module.exports = Order;

