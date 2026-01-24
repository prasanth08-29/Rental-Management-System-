const nodemailer = require('nodemailer');

// Create transporter
// For production, use environment variables: process.env.EMAIL_USER, process.env.EMAIL_PASS
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your SMTP provider
    auth: {
        user: process.env.EMAIL_USER || 'mock_user@example.com',
        pass: process.env.EMAIL_PASS || 'mock_password'
    }
});

const sendAgreementEmail = async (rental) => {
    try {
        if (!process.env.EMAIL_USER) {
            console.log('--- EMAIL SIMULATION ---');
            console.log(`To: ${rental.clientName} <email_placeholder@example.com>`); // Client email not currently in Rental model?
            console.log(`Subject: Your Rental Agreement - ${rental.product.name}`);
            console.log('Body: (HTML content hidden for brevity)');
            console.log('------------------------');
            return true;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'client_placeholder@example.com', // We need to add clientEmail to Rental model to make this real
            subject: `Rental Agreement - ${rental.serialNumber || 'Ref'}`,
            html: rental.agreementHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendAgreementEmail };
