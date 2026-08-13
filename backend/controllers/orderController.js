const Order = require('../models/orderModel');

// 1. Create Checkout Purchase Order Controller
exports.createOrder = (req, res) => {
    const { items, total } = req.body;

    if (!items || total === undefined) {
        return res.status(400).json({ error: 'Order items and total cost are required.' });
    }

    const user_id = req.user ? req.user.id : null;

    Order.create({ user_id, items, total }, (err, newOrderId) => {
        if (err) return res.status(500).json({ error: 'Failed to save order checkout.' });
        res.status(201).json({
            message: 'Order created successfully.',
            orderId: newOrderId
        });
    });
};

// 2. Fetch User Purchase Orders Controller
exports.getMyOrders = (req, res) => {
    Order.findByUserId(req.user.id, (err, orders) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch orders.' });
        
        // Parse items string from DB into JSON objects for client consumption
        const parsedOrders = orders.map(order => {
            let itemsData = order.items;
            if (typeof itemsData === 'string') {
                try {
                    itemsData = JSON.parse(itemsData);
                    if (typeof itemsData === 'string') {
                        itemsData = JSON.parse(itemsData);
                    }
                } catch (e) {
                    itemsData = [];
                }
            }
            if (!Array.isArray(itemsData)) {
                itemsData = [];
            }
            return {
                ...order,
                items: itemsData
            };
        });

        res.json({ orders: parsedOrders });
    });
};
