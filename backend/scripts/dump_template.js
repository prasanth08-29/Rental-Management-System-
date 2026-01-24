const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');
const fs = require('fs');

dotenv.config();

const dumpTemplate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const template = await Template.findOne();
        if (template) {
            fs.writeFileSync('current_template_dump.html', template.content);
            console.log('Template dumped to current_template_dump.html');
        } else {
            console.log('No template found');
        }
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

dumpTemplate();
