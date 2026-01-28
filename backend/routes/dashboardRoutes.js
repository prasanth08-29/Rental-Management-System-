const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Total Revenue (sum of securityDeposit + deliveryCharges + (pricePerDay * days))
        // Note: Ideally, we should store a 'totalAmount' field in Rental.
        // For now, let's aggregate based on what we have or just count simple metrics.

        // Let's stick to simple counts and lists first as per user request.

        const totalProducts = await Product.countDocuments();
        const activeRentals = await Rental.countDocuments({ endDate: { $gte: today } }); // Assuming active if endDate is future

        // Rentals ending today
        const dueToday = await Rental.find({
            endDate: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('product', 'name');

        // Rentals ending tomorrow (User asked for today/tomorrow in plan, but mostly today)
        const dueTomorrow = await Rental.find({
            endDate: {
                $gte: tomorrow,
                $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('product', 'name');


        res.json({
            totalProducts,
            activeRentals,
            dueToday,
            dueTomorrow
        });

    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ message: err.message || 'Server Error', error: err.toString() });
    }
});

module.exports = router;
