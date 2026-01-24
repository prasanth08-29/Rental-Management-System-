const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Template = require('../models/Template');
const Product = require('../models/Product');
const { sendAgreementEmail } = require('../utils/emailService');

// Get all rentals with pagination, search, and date filtering
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, search, page = 1, limit = 10 } = req.query;
        let query = {};

        // Date Filtering
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Search Filtering (Client Name or Phone)
        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { clientPhone: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const totalRentals = await Rental.countDocuments(query);
        const rentals = await Rental.find(query)
            .populate('product')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.json({
            rentals,
            totalPages: Math.ceil(totalRentals / limitNumber),
            currentPage: pageNumber,
            totalRentals
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single rental by ID
router.get('/:id', async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id).populate('product');
        if (!rental) return res.status(404).json({ message: 'Rental not found' });
        res.json(rental);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a rental and generate agreement
router.post('/', async (req, res) => {
    try {
        const { clientName, clientPhone, productId, startDate, endDate, serialNumber } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const template = await Template.findOne();
        if (!template) return res.status(500).json({ message: 'Agreement template not found' });

        // Calculate some values
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalRental = diffDays * product.pricePerDay;

        // Generate agreement HTML
        let agreementHtml = template.content
            .replace(/{{CLIENT_NAME}}/g, clientName)
            .replace(/{{CLIENT_PHONE}}/g, clientPhone)
            .replace(/{{CLIENT_ADDRESS}}/g, '') // Ensure placeholder is removed even if template has it
            .replace(/{{PRODUCT_NAME}}/g, product.name)
            .replace(/{{PRODUCT_DESCRIPTION}}/g, product.description || '')
            .replace(/{{SERIAL_NUMBER}}/g, serialNumber || '')
            .replace(/{{PICKUP_DATE}}/g, start.toLocaleDateString('en-IN'))
            .replace(/{{END_DATE}}/g, end.toLocaleDateString('en-IN'))
            .replace(/{{RENTAL_RATE}}/g, `Rs.${product.pricePerDay}/- per day`)
            .replace(/{{SECURITY_DEPOSIT}}/g, `Rs.${product.securityDeposit}/-`)
            .replace(/{{DELIVERY_CHARGES}}/g, `Rs.${product.deliveryCharges}/-`)
            .replace(/{{TOTAL_CHARGE}}/g, `Rs.${totalRental}/-`)
            .replace(/{{AGREEMENT_DATE}}/g, new Date().toLocaleDateString('en-IN'));

        const rental = new Rental({
            clientName,
            clientPhone,
            product: productId,
            startDate,
            endDate,
            securityDeposit: product.securityDeposit,
            deliveryCharges: product.deliveryCharges,
            serialNumber,
            agreementHtml,
        });

        const newRental = await rental.save();

        // Send email (async, don't block response)
        sendAgreementEmail({ ...newRental.toObject(), product: product });

        res.status(201).json(newRental);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Extend rental agreement
router.put('/:id/extend', async (req, res) => {
    try {
        const { newEndDate } = req.body;
        const rental = await Rental.findById(req.params.id);

        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        rental.endDate = newEndDate;
        const updatedRental = await rental.save();

        res.json(updatedRental);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
