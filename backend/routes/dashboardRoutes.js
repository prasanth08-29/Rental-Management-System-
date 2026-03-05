const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/authMiddleware');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch counts in parallel
        const [totalProducts, activeRentals, dueToday, dueTomorrow] = await Promise.all([
            Product.countDocuments(),
            Rental.countDocuments({ endDate: { $gte: today }, status: { $ne: 'Closed' } }),
            Rental.find({
                status: { $ne: 'Closed' },
                endDate: {
                    $gte: today,
                    $lt: tomorrow
                }
            }).populate('product', 'name'),
            Rental.find({
                status: { $ne: 'Closed' },
                endDate: {
                    $gte: tomorrow,
                    $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
                }
            }).populate('product', 'name')
        ]);

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

/**
 * GET /api/dashboard/analytics
 * Provides aggregated revenue data for charts
 * Query: ?range=last7days|last30days|lastYear&groupBy=day|month
 */
router.get('/analytics', adminAuth, async (req, res) => {
    try {
        const { range = 'last30days', groupBy = 'day' } = req.query;
        let startDate = new Date();

        // Define date range
        if (range === 'last7days') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === 'last30days') {
            startDate.setDate(startDate.getDate() - 30);
        } else if (range === 'last90days') {
            startDate.setDate(startDate.getDate() - 90);
        } else if (range === 'lastYear') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else {
            startDate.setDate(startDate.getDate() - 30);
        }

        const format = groupBy === 'month' ? "%Y-%m" : "%Y-%m-%d";

        const stats = await Rental.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $project: {
                    groupField: { $dateToString: { format: format, date: "$createdAt" } },
                    durationDays: {
                        $add: [
                            {
                                $floor: {
                                    $divide: [
                                        { $subtract: ["$endDate", "$startDate"] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            },
                            1
                        ]
                    },
                    rentalRate: { $ifNull: ["$rentalRate", 0] },
                    deliveryCharges: { $ifNull: ["$deliveryCharges", 0] }
                }
            },
            {
                $project: {
                    groupField: 1,
                    totalAmount: {
                        $add: [
                            { $multiply: ["$durationDays", "$rentalRate"] },
                            "$deliveryCharges"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$groupField",
                    amount: { $sum: "$totalAmount" },
                    bookings: { $count: {} }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(stats);
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ message: 'Failed to fetch analytics', error: err.toString() });
    }
});

module.exports = router;
