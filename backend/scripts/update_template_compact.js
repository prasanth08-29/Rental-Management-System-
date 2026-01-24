const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');

// Load env from current directory (since we run from backend root)
dotenv.config();

const compactTemplate = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.3; padding: 15px; max-width: 800px; margin: auto; border: 1px solid #eee; font-size: 11px;">
  
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #800000; padding-bottom: 5px; margin-bottom: 10px;">
    <div>
      <div style="font-size: 18px; font-weight: bold; color: #004080;">AEON CARE</div>
      <div style="font-size: 10px;">Homecare Equipment Rental Services</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; color: #004080; font-size: 14px;">Axium Health Solutions Pvt Ltd</div>
      <div style="font-size: 9px;">Plot No 114, Mount Poonamallee High Road, Porur, Chennai – 600 116</div>
    </div>
  </div>

  <h2 style="text-align: center; text-decoration: underline; margin: 0 0 10px 0; font-size: 16px;">HOMECARE EQUIPMENT RENTAL AGREEMENT</h2>
  <div style="text-align: center; margin-bottom: 10px;">Agreement Date: <strong>{{AGREEMENT_DATE}}</strong></div>

  <!-- Two Column Layout -->
  <div style="display: flex; gap: 20px; margin-bottom: 10px;">
    
    <!-- Left Column -->
    <div style="flex: 1;">
      <h3 style="background: #f0f0f0; padding: 3px; font-size: 12px; margin: 0 0 5px 0; border-bottom: 1px solid #ccc;">1. Renter Details</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li><strong>Name:</strong> {{CLIENT_NAME}}</li>
        <li><strong>Phone:</strong> {{CLIENT_PHONE}}</li>
        <!-- Address removed as per previous request, keeping minimal -->
      </ul>

      <h3 style="background: #f0f0f0; padding: 3px; font-size: 12px; margin: 10px 0 5px 0; border-bottom: 1px solid #ccc;">2. Equipment Details</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li><strong>Item:</strong> {{PRODUCT_NAME}}</li>
        <li><strong>Serial No:</strong> {{SERIAL_NUMBER}}</li>
        <li style="font-size: 10px; color: #555;">{{PRODUCT_DESCRIPTION}}</li>
      </ul>
    </div>

    <!-- Right Column -->
    <div style="flex: 1;">
      <h3 style="background: #f0f0f0; padding: 3px; font-size: 12px; margin: 0 0 5px 0; border-bottom: 1px solid #ccc;">3. Rental Terms & Charges</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <tr>
          <td style="padding: 2px;">Start Date:</td>
          <td style="font-weight: bold;">{{PICKUP_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 2px;">End Date:</td>
          <td style="font-weight: bold;">{{END_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 2px;">Rental Rate:</td>
          <td style="font-weight: bold;">{{RENTAL_RATE}}</td>
        </tr>
        <tr>
          <td style="padding: 2px;">Security Deposit:</td>
          <td style="font-weight: bold;">{{SECURITY_DEPOSIT}} (Refundable)</td>
        </tr>
        <tr>
          <td style="padding: 2px;">Delivery/Pickup:</td>
          <td style="font-weight: bold;">{{DELIVERY_CHARGES}}</td>
        </tr>
        <tr style="border-top: 1px solid #ddd;">
          <td style="padding: 4px 2px; font-weight: bold;">Total Initial:</td>
          <td style="padding: 4px 2px; font-weight: bold; color: #800000;">{{TOTAL_CHARGE}}</td>
        </tr>
      </table>
      <div style="font-size: 9px; font-style: italic; margin-top: 5px;">* Payments in advance.</div>
    </div>
  </div>

  <!-- Terms Section (Compact) -->
  <div style="margin-bottom: 10px;">
    <h3 style="background: #f0f0f0; padding: 3px; font-size: 12px; margin: 0 0 5px 0; border-bottom: 1px solid #ccc;">4. Terms & Conditions</h3>
    <div style="display: flex; gap: 20px;">
      <ul style="flex: 1; margin: 0; padding-left: 15px; font-size: 10px; line-height: 1.2;">
        <li><strong>Care:</strong> Keep equipment in good condition; use only for medical purposes. Do not move location without notice. No unauthorized repairs.</li>
        <li><strong>Liability:</strong> Renter is fully liable for damage, theft, or loss. Repair/replacement costs will be recovered.</li>
        <li><strong>Issues:</strong> Report malfunctions immediately to Axium Health Solutions.</li>
      </ul>
      <ul style="flex: 1; margin: 0; padding-left: 15px; font-size: 10px; line-height: 1.2;">
        <li><strong>Support:</strong> Maintenance provided by Axium. Replacements within 24hrs for malfunctions.</li>
        <li><strong>Termination:</strong> 48-hour notice required. Return in original condition. Deposit refund in 3-7 days after inspection.</li>
        <li><strong>Indemnity:</strong> Renter indemnifies Axium from usage-related claims.</li>
      </ul>
    </div>
  </div>

  <!-- Signatures -->
  <div style="margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid;">
    <div style="text-align: center;">
      <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 5px;"></div>
      <strong>Signature (Renter)</strong>
    </div>
    <div style="text-align: center;">
      <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 5px;"></div>
      <strong>Authorized Signatory (AeonCare)</strong>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 20px; border-top: 2px solid #800000; padding-top: 5px; text-align: center; font-size: 9px; color: #555;">
    <strong>GST IN: 33AAVCA8940R1ZO</strong> | Email: sales@aeoncare.in | Ph: +91 63694 04275
  </div>

</div>
`;

const updateTemplate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let template = await Template.findOne();
        if (!template) {
            template = new Template({ content: compactTemplate });
            console.log('Created new template');
        } else {
            template.content = compactTemplate;
            console.log('Updated existing template');
        }

        await template.save();
        console.log('Template successfully updated to compact version!');

        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateTemplate();
