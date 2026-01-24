const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');

dotenv.config();

const updateHeader = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let template = await Template.findOne();
        if (template) {
            // Changes:
            // 1. Reduced AEON CARE font size (24px -> 20px)
            // 2. Added Date: {{AGREEMENT_DATE}} to the right header column
            // 3. Reduced "Homecare Equipment Rental Agreement" font size (via style)
            // 4. Simplified the "This agreement is made..." line to just "Between:"

            const newContent = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.3; padding: 10px 20px; max-width: 800px; margin: auto; border: 1px solid #eee; background: #fff;">
    
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #800000; padding-bottom: 5px; margin-bottom: 10px;">
        <div style="font-size: 20px; font-weight: bold; color: #004080;">AEON CARE</div>
        <div style="text-align: right;">
            <div style="font-weight: bold; color: #004080; font-size: 14px;">Axium Health Solutions Pvt Ltd</div>
            <div style="font-size: 12px; color: #555; margin-top: 2px;">Date: {{AGREEMENT_DATE}}</div>
        </div>
    </div>
    
    <h2 style="text-align: center; text-decoration: underline; margin-bottom: 10px; margin-top: 0; font-size: 18px;">Homecare Equipment Rental Agreement</h2>
    
    <p style="margin-bottom: 5px; font-weight: bold;">Between:</p>
    <ul style="margin-top: 5px; margin-bottom: 10px;">
        <li><strong>Service Provider:</strong> Axium Health Solution Pvt Ltd (AeonCare)</li>
        <li><strong>Renter/Customer:</strong> {{CLIENT_NAME}}</li>
        <li><strong>Address:</strong> {{CLIENT_ADDRESS}}</li>
    </ul>

    <h3 style="border-bottom: 1px solid #ccc; margin-top: 10px; margin-bottom: 5px; font-size: 15px;">1. Equipment Details</h3>
    <ul style="margin-top: 5px; margin-bottom: 10px;">
        <li><strong>Item Rented:</strong> {{PRODUCT_NAME}}</li>
        <li><strong>Bed Type & Features:</strong> {{PRODUCT_DESCRIPTION}}</li>
        <li><strong>Serial Number:</strong> {{SERIAL_NUMBER}}</li>
    </ul>

    <h3 style="border-bottom: 1px solid #ccc; margin-top: 10px; margin-bottom: 5px; font-size: 15px;">2. Rental Period</h3>
    <ul style="margin-top: 5px; margin-bottom: 10px;">
        <li><strong>Start Date:</strong> {{PICKUP_DATE}}</li>
        <li><strong>End Date:</strong> {{END_DATE}} (or "Until Terminated by Either Party with Notice")</li>
    </ul>

    <h3 style="border-bottom: 1px solid #ccc; margin-top: 10px; margin-bottom: 5px; font-size: 15px;">3. Rental Charges</h3>
    <ul style="margin-top: 5px; margin-bottom: 5px;">
        <li><strong>Rental Rate:</strong> {{RENTAL_RATE}}</li>
        <li><strong>Security Deposit:</strong> {{SECURITY_DEPOSIT}} [Refundable amount]</li>
        <li><strong>Delivery & Pickup Charges:</strong> {{DELIVERY_CHARGES}}</li>
        <li><strong>Total Estimated Rental (Initial Period):</strong> {{TOTAL_CHARGE}}</li>
    </ul>
    <p style="margin-top: 2px; font-size: 12px;"><em>All payments are to be made in advance unless otherwise agreed in writing.</em></p>

    <!-- Split Layout with Separator Line -->
    <div style="display: flex; gap: 20px; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
        
        <!-- Left Column -->
        <div style="flex: 1; border-right: 1px solid #ccc; padding-right: 20px;">
            <h3 style="border-bottom: 1px solid #ccc; margin-top: 0; margin-bottom: 5px; font-size: 15px;">4. Responsibility of the Renter</h3>
            <ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px;">
                <li>Renter shall <strong>keep the equipment in good condition</strong> and use it only for intended medical purposes.</li>
                <li>Equipment <strong>must not be moved</strong> without prior notice.</li>
                <li>Renter shall <strong>inform Axium</strong> immediately of any malfunction.</li>
                <li><strong>No repairs</strong> or modifications without approval.</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 15px; margin-bottom: 5px; font-size: 15px;">6. Maintenance & Support</h3>
            <ul style="margin-top: 5px; margin-bottom: 10px; padding-left: 20px;">
                <li>Axium Health Solutions Pvt Ltd (Aeoncare) provides routine maintenance. Service/replacement within [24 hours].</li>
            </ul>
        </div>

        <!-- Right Column -->
        <div style="flex: 1; padding-left: 0;">
            <h3 style="border-bottom: 1px solid #ccc; margin-top: 0; margin-bottom: 5px; font-size: 15px;">5. Liability for Damage or Loss</h3>
            <ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px;">
                <li>The renter is <strong>liable for any damage, loss, or theft</strong> during the rental period.</li>
                <li>Any <strong>repair or replacement cost</strong> due to negligence will be recovered from the renter.</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 15px; margin-bottom: 5px; font-size: 15px;">7. Termination & Return</h3>
            <ul style="margin-top: 5px; margin-bottom: 10px; padding-left: 20px;">
                <li>Terminate with <strong>48-hour notice</strong>.</li>
                <li>Return in <strong>same condition</strong>.</li>
                <li>Deposit refund within [3-7 working days].</li>
            </ul>
        </div>

    </div>

    <h3 style="border-bottom: 1px solid #ccc; margin-top: 10px; margin-bottom: 5px; font-size: 15px;">8. Indemnity & Legal</h3>
    <ul style="margin-top: 5px; margin-bottom: 10px;">
        <li>The renter indemnifies Axium Health Solutions Pvt Ltd from all liability, claims, and damages arising from improper use.</li>
    </ul>

    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
        <div style="width: 280px; border-top: 1px solid #000; text-align: center; padding-top: 5px;">Signature (Renter)</div>
        <div style="width: 280px; border-top: 1px solid #000; text-align: center; padding-top: 5px;">Signature (Axium Health Service Pvt Ltd)</div>
    </div>

    <div style="margin-top: 5px; display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
        <!-- Date moved to top, removing redundant date fields here or keeping empty for manual if needed? User asked to place date in right top corner. 
             Usually signature dates are separate. I will keep these as placeholder lines for signing date. -->
        <div>Date: ___________</div>
        <div>Date: ___________</div>
    </div>

    <p style="font-size: 10px; font-style: italic; margin-top: 5px; margin-bottom: 5px;">Note: Renter should produce a copy of ID and address proof during the time of the agreement signing.</p>

    <div style="border-top: 2px solid #800000; padding-top: 5px; text-align: center; font-size: 11px;">
        <strong>GST IN: 33AAVCA8940R1ZO</strong><br/>
        Address: Plot No 114, Mount Poonamallee High Road, Porur, Chennai – 600 0116<br/>
        E-mail ID: sales@aeoncare.in; aeolushealthcare@gmail.com | Contact Number: +91 63694 04275
    </div>
</div>
`;
            template.content = newContent;
            await template.save();
            console.log('Template header and date updated!');
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

updateHeader();
