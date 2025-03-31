# Email Notifications Setup

### Is This Required?
- No. Email notifications are completely optional
- The application works perfectly without them
- Only set this up if you want automatic email alerts

### Understanding Email Password (EMAIL_PASS)

#### What is EMAIL_PASS?
The `EMAIL_PASS` field is where you put your email account's authentication credentials. There are two main ways to do this:

1. **App Password (Recommended)**
   - A special password generated specifically for applications
   - More secure than your main account password
   - Required if you have two-factor authentication enabled
   - Unique to each application you connect

2. **Regular Account Password**
   - Your standard email account password
   - Less secure
   - Not recommended for most email providers

#### How to Get the Right Password

**For Most Email Providers**:
1. Log into your email account settings
2. Find the security or app passwords section
3. Enable two-factor authentication (if not already active)
4. Generate an app-specific password
5. Select "Mail" or "SMTP" as the application type
6. Copy the generated password
7. Use THIS password in EMAIL_PASS

**Specific Provider Examples**:
- **Gmail**: 
  1. Go to Google Account > Security
  2. Enable 2-Step Verification
  3. Go to "App passwords"
  **https://myaccount.google.com/apppasswords**
  4. Generate a 16-character password

- **Outlook/Office 365**:
  1. Go to Microsoft Account security settings
  2. Look for "App passwords" or "Additional security"
  3. Generate an app-specific password

### How to Create .env File

#### Step 1: Create the File
1. In the project's root directory, create a file named `.env`
2. Open the file in a text editor
3. Add the following configuration:

```env
# Email address that will RECEIVE notifications
ADMIN_EMAIL=your_email@example.com

# Email account that will SEND notifications
EMAIL_FROM=your_sending_email@example.com
EMAIL_USER=your_sending_email@example.com

# App-specific password you generated
EMAIL_PASS=your_app_password

# SMTP server settings (get these from your email provider)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Example .env File
```env
# Real-world example
ADMIN_EMAIL=johndoe@company.com
EMAIL_FROM=mycompany.notifications@example.com
EMAIL_USER=mycompany.notifications@example.com
EMAIL_PASS=your_generated_app_password
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Finding Your SMTP Settings

#### How to Get Accurate SMTP Details
1. Check your email provider's official documentation
2. Contact your email provider's support
3. Look for these key pieces of information:
   - SMTP Server Address
   - Port Number (usually 587 or 465)
   - Whether SSL/TLS is required

#### Common Providers' Documentation
- **Gmail**: Google Workspace SMTP Settings
- **Outlook/Office 365**: Microsoft SMTP Configuration
- **Other Providers**: Check their support websites

### Important Warnings
- Do NOT use your regular account password
- Keep your .env file PRIVATE
- Never commit .env to version control
- The .gitignore file should already prevent .env from being shared

### Troubleshooting
- Double-check ALL settings
- Verify app password is copied correctly
- Ensure two-factor authentication is enabled
- Confirm SMTP settings with your email provider

### Want to Skip Email Notifications?
Simply do not create the .env file. The app will work normally.

### Need More Help?
- Check your email provider's support documentation
- Contact your email provider's support team
- Look for specific instructions on "SMTP access" or "App passwords"