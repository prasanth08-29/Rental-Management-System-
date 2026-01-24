const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
// Get all products with pagination and search
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limitNumber),
            currentPage: pageNumber,
            totalProducts
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create product
router.post('/', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        pricePerDay: req.body.pricePerDay,
        stock: req.body.stock,
        securityDeposit: req.body.securityDeposit,
        deliveryCharges: req.body.deliveryCharges,
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.body.name != null) product.name = req.body.name;
        if (req.body.description != null) product.description = req.body.description;
        if (req.body.pricePerDay != null) product.pricePerDay = req.body.pricePerDay;
        if (req.body.stock != null) product.stock = req.body.stock;
        if (req.body.securityDeposit != null) product.securityDeposit = req.body.securityDeposit;
        if (req.body.deliveryCharges != null) product.deliveryCharges = req.body.deliveryCharges;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
