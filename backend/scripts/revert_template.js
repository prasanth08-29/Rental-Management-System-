const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');

// Load env from current directory
dotenv.config();

const originalTemplate = `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; padding: 20px; max-width: 800px; margin: auto; border: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #800000; padding-bottom: 10px; margin-bottom: 20px;">
              <div style="font-size: 24px; font-weight: bold; color: #004080;">AEON CARE</div>
              <div style="text-align: right; font-weight: bold; color: #004080;">Axium Health Solutions Pvt Ltd</div>
            </div>
            
            <h2 style="text-align: center; text-decoration: underline; margin-bottom: 20px;">Homecare Equipment Rental Agreement</h2>
            
            <p>This agreement is made on <strong>{{AGREEMENT_DATE}}</strong>, between:</p>
            <ul>
              <li><strong>Service Provider:</strong> Axium Health Solution Pvt Ltd (AeonCare)</li>
              <li><strong>Renter/Customer:</strong> {{CLIENT_NAME}}</li>
              <li><strong>Address:</strong> {{CLIENT_ADDRESS}}</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">1. Equipment Details</h3>
            <ul>
              <li><strong>Item Rented:</strong> {{PRODUCT_NAME}}</li>
              <li><strong>Bed Type & Features:</strong> {{PRODUCT_DESCRIPTION}}</li>
              <li><strong>Serial Number:</strong> {{SERIAL_NUMBER}}</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">2. Rental Period</h3>
            <ul>
              <li><strong>Start Date:</strong> {{PICKUP_DATE}}</li>
              <li><strong>End Date:</strong> {{END_DATE}} (or "Until Terminated by Either Party with Notice")</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">3. Rental Charges</h3>
            <ul>
              <li><strong>Rental Rate:</strong> {{RENTAL_RATE}}</li>
              <li><strong>Security Deposit:</strong> {{SECURITY_DEPOSIT}} [Refundable amount]</li>
              <li><strong>Delivery & Pickup Charges:</strong> {{DELIVERY_CHARGES}}</li>
              <li><strong>Total Estimated Rental (Initial Period):</strong> {{TOTAL_CHARGE}}</li>
            </ul>
            <p><em>All payments are to be made in advance unless otherwise agreed in writing.</em></p>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">4. Responsibility of the Renter</h3>
            <ul>
              <li>Renter shall <strong>keep the equipment in good condition</strong> and use it only for intended medical purposes.</li>
              <li>Equipment <strong>must not be moved to a different location</strong> without prior notice.</li>
              <li>Renter shall <strong>inform Axium Health Solutions Pvt Ltd (AeonCare) immediately</strong> of any malfunction, damage, or safety concern.</li>
              <li><strong>No repairs</strong> or modifications should be made without written approval.</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">5. Liability for Damage or Loss</h3>
            <ul>
              <li>The renter is <strong>liable for any damage, loss, or theft</strong> of the equipment during the rental period.</li>
              <li>Any <strong>repair or replacement cost</strong> due to negligence or misuse will be recovered from the renter.</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">6. Maintenance & Support</h3>
            <ul>
              <li>Axium Health Solutions Pvt Ltd (Aeoncare) provides routine maintenance and support. If any malfunction, Service or replacement will be arranged within [24 hours].</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">7. Termination & Return</h3>
            <ul>
              <li>Either party may terminate this agreement with a <strong>48-hour notice</strong>.</li>
              <li>Equipment must be <strong>returned in the same condition</strong> as delivered.</li>
              <li>Security deposit will be refunded after inspection within [3-7 working days].</li>
            </ul>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">8. Indemnity & Legal</h3>
            <ul>
              <li>The renter indemnifies Axium Health Solutions Pvt Ltd from all liability, claims, and damages arising from improper use.</li>
            </ul>

            <div style="margin-top: 60px; display: flex; justify-content: space-between;">
              <div style="width: 280px; border-top: 1px solid #000; text-align: center; padding-top: 5px;">Signature (Renter)</div>
              <div style="width: 280px; border-top: 1px solid #000; text-align: center; padding-top: 5px;">Signature (Axium Health Service Pvt Ltd)</div>
            </div>

            <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 40px;">
              <div>Date: ___________</div>
              <div>Date: ___________</div>
            </div>

            <p style="font-size: 10px; font-style: italic; margin-top: 20px;">Note: Renter should produce a copy of ID and address proof during the time of the agreement signing.</p>

            <div style="margin-top: 30px; border-top: 2px solid #800000; padding-top: 10px; text-align: center; font-size: 11px;">
              <strong>GST IN: 33AAVCA8940R1ZO</strong><br/>
              Address: Plot No 114, Mount Poonamallee High Road, Porur, Chennai – 600 0116<br/>
              E-mail ID: sales@aeoncare.in; aeolushealthcare@gmail.com | Contact Number: +91 63694 04275
            </div>
          </div>
        `;

const revertTemplate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let template = await Template.findOne();
        if (template) {
            template.content = originalTemplate;
            await template.save();
            console.log('Reverted template to original version');
        } else {
            console.log('No template found to revert');
        }

        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

revertTemplate();
