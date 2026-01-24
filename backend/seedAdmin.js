const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding');

        const email = 'admin@aeoncare.com';
        const password = 'admin';

        let user = await User.findOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            user.password = hashedPassword;
            user.role = 'admin';
            await user.save();
            console.log('Admin user updated. Login: ' + email + ' / ' + password);
        } else {
            user = new User({
                email,
                password: hashedPassword,
                role: 'admin'
            });
            await user.save();
            console.log('Admin user created. Login: ' + email + ' / ' + password);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
