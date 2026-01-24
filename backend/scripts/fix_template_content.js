const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');

dotenv.config();

const fixTemplate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let template = await Template.findOne();
        if (template && template.content) {
            const content = template.content;

            // Check if content wraps HTML in markdown code blocks
            if (content.includes('```html')) {
                console.log('Found markdown code block. Extracting HTML...');
                const parts = content.split('```html');
                if (parts.length > 1) {
                    let cleanHtml = parts[1].split('```')[0];
                    cleanHtml = cleanHtml.trim(); // Remove whitespace

                    template.content = cleanHtml;
                    await template.save();
                    console.log('Template fixed and saved!');
                } else {
                    console.log('Could not parse markdown block structure.');
                }
            } else {
                console.log('No markdown code block found. Content might already be clean or different format.');
            }
        } else {
            console.log('No template found');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixTemplate();
