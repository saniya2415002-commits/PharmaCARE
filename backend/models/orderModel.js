const { supabase } = require('../config/db');

const Order = {
    // Create an order checkout record
    create: (orderData, callback) => {
        const { user_id, items, total } = orderData;
        let itemsJson = items;
        if (typeof items === 'string') {
            try {
                itemsJson = JSON.parse(items);
            } catch (e) {
                itemsJson = items;
            }
        }
        
        supabase
            .from('orders')
            .insert([{
                user_id: user_id || null,
                items: itemsJson,
                total: total
            }])
            .select('id')
            .single()
            .then(({ data, error }) => {
                callback(error, data ? data.id : null);
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

