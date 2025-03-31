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
  if (!process.env.EMAIL_FROM || !process.env.ADMIN_EMAIL) {
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
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: "New Web Development Inquiry Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Project Submission Received</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                leadData.firstName
              } ${leadData.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                leadData.email
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                leadData.businessName || "N/A"
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Service Desired:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                leadData.serviceDesired
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Message:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                leadData.message || "N/A"
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Submitted At:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please log in to your dashboard to view full details.</p>
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
