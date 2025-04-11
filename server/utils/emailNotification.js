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
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🔔 New ${leadData.serviceDesired} inquiry from ${leadData.businessName}🔔`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.5; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #2c3e50; color: white; padding: 20px; border-radius: 6px 6px 0 0; margin-bottom: 20px;">
            <h2 style="margin: 0; font-weight: 600; font-size: 22px;">🚀 New Client Opportunity! 💻</h2>
            <h3 style="margin: 10px 0 0; font-weight: 500; font-size: 18px; opacity: 0.9;">${
              leadData.businessName
            } is interested in your services!</h3>
            <p style="margin: 5px 0 0; opacity: 0.8;">${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <!-- Client Information Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #ff6b6b;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50;">Client Information</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d; font-size: 14px;">Contact details for follow-up</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Name:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">${
                  leadData.firstName
                } ${leadData.lastName}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Phone:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">${
                  leadData.phone
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Phone Ext:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">${
                  leadData.phoneExt || "N/A"
                }</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Email:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">
                  <a href="mailto:${
                    leadData.email
                  }" style="color: #3498db; text-decoration: none;">${
        leadData.email
      }</a>
                </td>
              </tr>
            </table>
            
            <!-- Business Information Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #4ecdc4;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50;">Business Information</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d; font-size: 14px;">Business details provided</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Business Name:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">${
                  leadData.businessName || "N/A"
                }</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Business Phone:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">${
                  leadData.businessPhone || "N/A"
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Business Phone Ext:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">${
                  leadData.businessPhoneExt || "N/A"
                }</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Business Email:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">
                  ${
                    leadData.businessEmail
                      ? `<a href="mailto:${leadData.businessEmail}" style="color: #3498db; text-decoration: none;">${leadData.businessEmail}</a>`
                      : "N/A"
                  }
                </td>
              </tr>
            </table>
            
            <!-- Inquiry Details Section with colored left border -->
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 5px solid #ffbe0b;">
              <h3 style="margin: 0; font-size: 18px; color: #2c3e50;">Inquiry Details</h3>
              <p style="margin: 5px 0 0; color: #7f8c8d; font-size: 14px;">Service request information</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Service Desired:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">
                  <span style="display: inline-block; background-color: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${
                    leadData.serviceDesired
                  }</span>
                </td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Preferred Contact:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">
                  ${
                    leadData.preferredContact == "businessPhone"
                      ? "Business Phone"
                      : leadData.preferredContact === "businessEmail"
                      ? "Business Email"
                      : leadData.preferredContact[0].toUpperCase() +
                          leadData.preferredContact.slice(1) || "N/A"
                  }
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Billing Address:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top;">
                  ${
                    leadData.billingAddress
                      ? `${leadData.billingAddress.street || ""}<br>
                    ${
                      leadData.billingAddress.aptUnit
                        ? `#${leadData.billingAddress.aptUnit}<br>`
                        : ""
                    }
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
                <td style="padding: 12px; width: 30%; color: #7f8c8d; font-weight: 600; font-size: 14px; vertical-align: top;">Message:</td>
                <td style="padding: 12px; color: #2c3e50; font-size: 15px; vertical-align: top; line-height: 1.6; text-align: left;">
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid #ddd; font-style: italic;">
                    "${leadData.message || "No message provided"}"
                  </div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Action Section with colored left border -->
          <div style="margin-top: 25px; padding-left: 15px; border-left: 5px solid #9775fa; background-color: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="margin: 0; font-size: 18px; color: #2c3e50;">Next Steps</h3>
            <p style="margin: 10px 0 0; font-size: 14px; color: #2c3e50;">
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

module.exports = { sendLeadNotificationEmail };
