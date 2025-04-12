const nodemailer = require("nodemailer");

/**
 * Create an email transporter based on configuration
 * @returns {Object|null} Nodemailer transporter or null if not configured
 */
function createEmailTransporter() {
  // Check if email configuration is complete
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

/**
 * Get formatted preferred contact method name and corresponding value
 * @param {Object} leadData - Details of the submitted lead
 * @returns {Object} Object containing formatted method name and contact value
 */
function getPreferredContactDetails(leadData) {
  const method = leadData.preferredContact;
  let formattedMethod = "";
  let contactValue = "";
  let text = leadData.text && leadData.phone;

  switch (method) {
    case "email":
      formattedMethod = "Email";
      contactValue = leadData.email;
      break;
    case "phone":
      formattedMethod = "Phone";
      contactValue = leadData.phone;
      break;
    case "businessEmail":
      formattedMethod = "Business Email";
      contactValue = leadData.businessEmail;
      break;
    case "businessPhone":
      formattedMethod = "Business Phone";
      contactValue = leadData.businessPhone;
      break;
    case "text":
      formattedMethod = "Text";
      contactValue = leadData.text || leadData.phone;
      break;
    default:
      // Capitalize first letter of method
      formattedMethod = method.charAt(0).toUpperCase() + method.slice(1);
      contactValue = "N/A";
  }

  return { formattedMethod, contactValue };
}

/**
 * Send email notification about a new lead submission
 * @param {Object} leadData - Details of the submitted lead
 */
async function sendLeadNotificationEmail(leadData) {
  // Validate required environment variables
  if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
    console.warn("Email notification not configured. Skipping.");
    return null;
  }

  // Create transporter
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn("Email transporter not configured. Skipping notification.");
    return null;
  }

  try {
    const fullName = `${leadData.businessName}`;
    const contactDetails = getPreferredContactDetails(leadData);

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🔔 New ${leadData.serviceDesired} inquiry from ${leadData.businessName} 🔔`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; max-width: 650px; margin: 0 auto; padding: 20px; color: #333 !important; line-height: 1.5; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #2c3e50; color: white !important; padding: 20px; border-radius: 6px 6px 0 0; margin-bottom: 20px;">
            <h2 style="margin: 0; font-weight: 600; font-size: 22px; color: white !important; text-decoration: none !important;">🚀 New Client Opportunity! 💻</h2>
            <h3 style="margin: 10px 0 0; font-weight: 500; font-size: 18px; opacity: 0.9; color: white !important; text-decoration: none !important;">${
              leadData.businessName
            } is interested in your services!</h3>
            <p style="margin: 5px 0 0; opacity: 0.8; color: white !important;">${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <!-- Client Information Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #ff6b6b;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Client Information</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px;">Contact details for follow-up</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Name:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.firstName
                } ${leadData.lastName}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Phone:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.phone
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Phone Ext:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.phoneExt || "N/A"
                }</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Email:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  <a href="mailto:${
                    leadData.email
                  }" style="color: #3498db !important; text-decoration: none !important;">${
        leadData.email
      }</a>
                </td>
              </tr>
            </table>
            
            <!-- Business Information Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #4ecdc4;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Business Information</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px;">Business details provided</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Business Name:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.businessName || "N/A"
                }</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Business Phone:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.businessPhone || "N/A"
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Business Phone Ext:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.businessPhoneExt || "N/A"
                }</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Business Email:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  ${
                    leadData.businessEmail
                      ? `<a href="mailto:${leadData.businessEmail}" style="color: #3498db !important; text-decoration: none !important;">${leadData.businessEmail}</a>`
                      : "N/A"
                  }
                </td>
              </tr>
            </table>
            
            <!-- Inquiry Details Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #ffbe0b;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Inquiry Details</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px;">Service request information</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Service Desired:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  <span style="display: inline-block; background-color: #3498db; color: white !important; padding: 4px 8px; border-radius: 4px; font-size: 14px; text-decoration: none !important;">${
                    leadData.serviceDesired
                  }</span>
                </td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Preferred Contact:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  ${contactDetails.formattedMethod}: ${
        contactDetails.contactValue
      }
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Billing Address:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  ${
                    leadData.billingAddress
                      ? `${leadData.billingAddress.street || ""}
                    ${
                      leadData.billingAddress.aptUnit
                        ? `, ${leadData.billingAddress.aptUnit}`
                        : ""
                    }<br>
                    ${leadData.billingAddress.city || ""}, ${
                          leadData.billingAddress.state || ""
                        } ${leadData.billingAddress.zipCode || ""}, ${
                          leadData.billingAddress.country
                        }`
                      : "Not provided"
                  }
                </td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Message:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top; line-height: 1.6; text-align: left;">
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid #ddd; font-style: italic; color: #2c3e50 !important;">
                    "${leadData.message || "No message provided"}"
                  </div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Action Section with colored left border -->
          <div style="margin-top: 25px; padding-left: 15px; border-left: 5px solid #9775fa; background-color: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Next Steps</h3>
            <p style="margin: 10px 0 0; font-size: 14px; color: #2c3e50 !important;">
              Please access your dashboard for more details and to manage this lead/project.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Lead notification email sent successfully");
    return info;
  } catch (error) {
    console.error("Detailed Email Sending Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}

/**
 * Send a confirmation email to the lead
 * @param {Object} leadData - Details of the submitted lead
 */
async function sendLeadConfirmationEmail(leadData) {
  // Validate required environment variables
  if (!process.env.EMAIL_USER) {
    console.warn("Email notification not configured. Skipping.");
    return null;
  }

  // Create transporter
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn("Email transporter not configured. Skipping confirmation.");
    return null;
  }

  try {
    const contactDetails = getPreferredContactDetails(leadData);

    // Send confirmation email to the lead
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: leadData.email,
      subject: `Thank You for Your ${leadData.serviceDesired} Inquiry`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; max-width: 650px; margin: 0 auto; padding: 20px; color: #333 !important; line-height: 1.5; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #2c3e50; color: white !important; padding: 20px; border-radius: 6px 6px 0 0; margin-bottom: 20px;">
            <h2 style="margin: 0; font-weight: 600; font-size: 22px; color: white !important; text-decoration: none !important;">Thank You for Your Inquiry!</h2>
            <h3 style="margin: 10px 0 0; font-weight: 500; font-size: 18px; opacity: 0.9; color: white !important; text-decoration: none !important;">We've received your ${
              leadData.serviceDesired
            } request</h3>
            <p style="margin: 5px 0 0; opacity: 0.8; color: white !important;">${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <!-- Greeting Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #3498db;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Hello, ${
                leadData.firstName
              }!</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px;">Thank you for reaching out to us</p>
            </div>
            
            <p style="color: #2c3e50 !important; line-height: 1.6; margin-bottom: 20px;">
              We're excited to connect with you about your <strong style="color: #3498db !important;">${
                leadData.serviceDesired
              }</strong> needs. Your inquiry has been received and is being reviewed by our team.
            </p>
            
            <!-- Confirmation Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #4ecdc4;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Your Request Details</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px;">Summary of your submission</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Name:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.firstName
                } ${leadData.lastName}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Business:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">${
                  leadData.businessName || "N/A"
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Service Requested:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  <span style="display: inline-block; background-color: #3498db; color: white !important; padding: 4px 8px; border-radius: 4px; font-size: 14px; text-decoration: none !important;">${
                    leadData.serviceDesired
                  }</span>
                </td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d !important; font-weight: 600; font-size: 14px; vertical-align: top;">Contact Method:</td>
                <td style="padding: 12px; color: #2c3e50 !important; font-size: 15px; vertical-align: top;">
                  ${contactDetails.formattedMethod}: ${
        contactDetails.contactValue
      }
                </td>
              </tr>
            </table>
            
            <!-- Next Steps Section with colored left border -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <div style="display: flex; margin-bottom: 15px; align-items: center;">
                <div style="width: 30px; height: 30px; background-color: #3498db; color: white !important; border-radius: 50%; margin-right: 15px; text-align: center; font-weight: bold; font-size: 14px; line-height: 30px; text-decoration: none !important;">1</div>
                <div>
                  <h4 style="margin: 0; color: #2c3e50 !important; font-size: 16px; text-decoration: none !important;">Review</h4>
                  <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px; text-decoration: none !important;">Our team will carefully review your inquiry details</p>
                </div>
              </div>
                
              <div style="display: flex; margin-bottom: 15px; align-items: center;">
                <div style="width: 30px; height: 30px; background-color: #3498db; color: white !important; border-radius: 50%; margin-right: 15px; text-align: center; font-weight: bold; font-size: 14px; line-height: 30px; text-decoration: none !important;">2</div>
                <div>
                  <h4 style="margin: 0; color: #2c3e50 !important; font-size: 16px; text-decoration: none !important;">Contact</h4>
                  <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px; text-decoration: none !important;">We'll reach out via your preferred contact method within 1-2 business days</p>
                </div>
              </div>
                
              <div style="display: flex; align-items: center;">
                <div style="width: 30px; height: 30px; background-color: #3498db; color: white !important; border-radius: 50%; margin-right: 15px; text-align: center; font-weight: bold; font-size: 14px; line-height: 30px; text-decoration: none !important;">3</div>
                <div>
                  <h4 style="margin: 0; color: #2c3e50 !important; font-size: 16px; text-decoration: none !important;">Consultation</h4>
                  <p style="margin: 5px 0 0; color: #7f8c8d !important; font-size: 14px; text-decoration: none !important;">Schedule your free consultation to discuss your needs in detail</p>
                </div>
              </div>
            </div>
            
            <!-- CTA Section -->
            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 25px; border-left: 5px solid #3498db;">
              <h3 style="margin: 0 0 10px; color: #2c3e50 !important; font-size: 18px; text-decoration: none !important;">Ready to get started sooner?</h3>
              <p style="margin: 0 0 15px; color: #7f8c8d !important; font-size: 14px;">Skip the wait and schedule your consultation now</p>
              <a href="https://cal.com/devmansam/consultation" style="display: inline-block; background-color: #3498db; color: white !important; padding: 12px 24px; border-radius: 4px; text-decoration: none !important; font-weight: 600; font-size: 16px;">Schedule Consultation</a>
            </div>
          </div>
          
          <!-- Support Section with colored left border -->
          <div style="margin-top: 25px; padding-left: 15px; border-left: 5px solid #4ecdc4; background-color: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="margin: 0; font-size: 18px; color: #2c3e50 !important; text-decoration: none !important;">Questions?</h3>
            <p style="margin: 10px 0 0; font-size: 14px; color: #7f8c8d !important;">
              If you have any questions, please reply to this email or contact us at <a href="mailto:sam@devmansam.net" style="color: #3498db !important; text-decoration: none !important;">sam@devmansam.net</a>.
            </p>
          </div>
          
          <div style="margin-top: 25px; text-align: center; color: #7f8c8d !important; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Devmansam Consulting. All rights reserved.</p>
            <p>This is an automated message.</p>
          </div>
        </div>
      `,
    });

    console.log("Lead confirmation email sent successfully");
    return info;
  } catch (error) {
    console.error("Detailed Confirmation Email Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}

// Exports
module.exports = {
  sendLeadNotificationEmail,
  sendLeadConfirmationEmail,
};
