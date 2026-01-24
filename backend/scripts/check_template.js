const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');

dotenv.config();

const checkTemplate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const templates = await Template.find();
        console.log(`Found ${templates.length} templates.`);

        templates.forEach((t, i) => {
            console.log(`\n--- Template ${i + 1} ID: ${t._id} ---`);
            console.log('Content Preview (first 500 chars):');
            console.log(t.content);
            console.log('-------------------------\n');
        });

        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTemplate();
