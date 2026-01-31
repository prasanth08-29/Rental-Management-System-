const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    securityDeposit: { type: Number },
    deliveryCharges: { type: Number },
    rentalRate: { type: Number },
    serialNumber: { type: String },
    agreementHtml: { type: String }, // Storing the generated agreement at that time
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);
