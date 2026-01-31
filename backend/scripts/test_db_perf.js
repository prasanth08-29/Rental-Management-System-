require('dotenv').config();
const mongoose = require('mongoose');

// Mock Models
const rentalSchema = new mongoose.Schema({ endDate: Date });
const fileSchema = new mongoose.Schema({}); // Product

const Rental = mongoose.model('Rental', rentalSchema);
const Product = mongoose.model('Product', fileSchema);

const testDB = async () => {
    console.time('Total Time');
    try {
        console.log('Connecting to DB...');
        console.time('Connection');
        await mongoose.connect(process.env.MONGODB_URI);
        console.timeEnd('Connection');

        console.log('Running Queries...');
        console.time('Queries');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalProducts, activeRentals, dueToday, dueTomorrow] = await Promise.all([
            Product.countDocuments(),
            Rental.countDocuments({ endDate: { $gte: today } }),
            Rental.find({ endDate: { $gte: today, $lt: tomorrow } }),
            Rental.find({ endDate: { $gte: tomorrow, $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) } })
        ]);

        console.timeEnd('Queries');
        console.log({ totalProducts, activeRentals, dueTodayCount: dueToday.length, dueTomorrowCount: dueTomorrow.length });

    } catch (err) {
        console.error(err);
    } finally {
        console.timeEnd('Total Time');
        await mongoose.disconnect();
    }
};

testDB();
