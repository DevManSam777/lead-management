# DevLeads - Professional Lead and Project Management System

A comprehensive lead and project management application built with Node.js, Express, MongoDB, and Firebase Authentication. Features a powerful dashboard for managing leads, forms, payments, business hitlists, and document management with analytics and visualizations.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. MongoDB Atlas Setup](#1-mongodb-atlas-setup)
  - [2. Firebase Project Setup](#2-firebase-project-setup)
  - [3. Email Configuration (Optional)](#3-email-configuration-optional)
  - [4. Environment Variables](#4-environment-variables)
  - [5. Installation & Development](#5-installation--development)
  - [6. Production Deployment](#6-production-deployment)
- [Web Component Usage](#web-component-usage)
- [Optional: YP-Scraper Integration](#optional-yp-scraper-integration)
- [Application Architecture](#application-architecture)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

## Features

### Core Management
- **Lead/Project Management**: Track and manage potential clients with full lifecycle support
- **Advanced Form Builder**: Create custom templates for contracts, proposals, invoices with Markdown support
- **Payment Tracking**: Monitor project payments, balances, and financial analytics
- **Business Hitlists**: Organize prospect businesses for outreach campaigns
- **Document Management**: Upload, view, and manage PDF documents per lead
- **Resource Library**: Curated collection of business, design, development, and utility tools with direct links

### Analytics & Reporting
- **Interactive Charts**: Real-time project status distribution, revenue trends, and performance metrics
- **Financial Analytics**: Monthly revenue tracking, all-time earnings, conversion rates
- **Performance Dashboards**: Key metrics with month-over-month comparisons

### User Experience
- **Responsive Design**: Clean and adaptive layouts
- **Dark/Light Themes**: System preference detection with manual override
- **Customizable Date Formats**: Multiple format options (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- **Advanced Search & Filtering**: Multi-field search with status filters and sorting
- **Pagination**: Configurable page sizes with "Show All" option

### Communication & Automation
- **Email Notifications**: Automatic notifications for new leads (optional)
- **Web Component**: Embeddable inquiry form for websites (optional)
- **Form Generation**: Dynamic form creation with lead data population
- **Timezone-Aware**: Proper handling of dates across timezones

### Data Management
- **Import/Export**: JSON import for business data, Markdown, PDF export for forms
- **Data Validation**: Client-side and server-side validation
- **Backup Integration**: MongoDB Atlas built-in backups

### Resource Library
The Resources page provides quick access to essential tools and services (Business Resources, Design Resources, Development Resources, and Tools/Utilities):


## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (free tier available)
- **Firebase** account (free tier available)
- **Email account** with SMTP access (optional for notifications)

## Setup Instructions

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Sandbox for free tier)

2. **Configure Database Access**
   - Go to Database Access → Add New Database User
   - Create a username and password (save these!)
   - Set permissions: "Read and write to any database"

3. **Configure Network Access**
   - Go to Network Access → Add IP Address
   - Development: Add `0.0.0.0/0` (allow access from anywhere)
   - Production: Add your server's specific IP addresses

4. **Get Connection String**
   - Go to Clusters → Connect → Connect your application
   - Select Node.js driver version 4.1 or later
   - Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

### 2. Firebase Project Setup

#### A. Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Click "Create a project"**
3. **Enter project name** and follow the setup wizard
4. **Enable Analytics** (optional but recommended)

#### B. Setup Authentication

1. **Go to Authentication → Get Started**
2. **Go to Sign-in method tab**
3. **Enable Email/Password** authentication
4. **Add authorized domains** for production (your domain)

#### C. Get Web App Configuration

1. **Go to Project Settings** (gear icon)
2. **Scroll to "Your apps" section**
3. **Click Web icon** to add a web app
4. **Register your app** with a nickname
5. **Copy the Firebase configuration object (public facing keys)**:

```javascript
// Example - yours will be different
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

#### D. Generate Service Account Key

1. **Go to Project Settings → Service Accounts**
2. **Click "Generate new private key"**
3. **Download the JSON file** (keep secure!)
4. **Extract these values** from the JSON:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`
   - `auth_uri`
   - `token_uri`
   - `auth_provider_x509_cert_url`
   - `client_x509_cert_url`
   - `universe_domain`

### 3. Email Configuration (Optional)

**Note**: Email notifications are optional. The system works without them.

#### Quick Setup:
1. **Enable 2-factor authentication** on your email account
2. **Generate app-specific password** (not your regular password)
3. **Get SMTP settings**:
   - **Gmail**: `smtp.gmail.com`, port `587`
   - **Outlook**: `smtp-mail.outlook.com`, port `587`

#### Email Template Customization

Edit `server/utils/emailNotification.js` to customize:

- **Business Information**: Update contact details and branding
- **Email Styling**: Modify colors, fonts, and layout
- **Content**: Customize greeting messages and next steps
- **Branding**: Add your logo and brand colors

```javascript
// Example customization
const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
// Update with your brand colors
<div style="background-color: #your-brand-color; color: white;">
```

### 4. Environment Variables

Create `.env` file in the **root directory**:

```env
# ===== DATABASE =====
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devleads

# ===== SERVER =====
PORT=5000
NODE_ENV=development

# ===== FIREBASE ADMIN SDK =====
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/project/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# ===== EMAIL NOTIFICATIONS (OPTIONAL) =====
ADMIN_EMAIL=your-admin-email@example.com
EMAIL_FROM=your-sending-email@example.com
EMAIL_USER=your-sending-email@example.com
EMAIL_PASS=your-app-specific-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Important**: Never commit the `.env` file to version control!  

### 5. Installation & Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd devleads
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Update Firebase Configuration**
   
   Edit `dashboard/js/authApi.js` and replace the `firebaseConfig` object:

```javascript
// Replace with your Firebase web app configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
   - **Dashboard**: `http://localhost:5000/login`
   - **API Documentation**: `http://localhost:5000/api`
   - **Web Form Demo**: Open `web-inquiry-form/web-inquiry-form.html`

6. **Create your first user**
   - Navigate to `http://localhost:5000/login`
   - Register through Firebase Console or via the application

### 6. Production Deployment

#### A. Environment Configuration
```env
NODE_ENV=production
# Update MONGO_URI for production database if different
# Set production domain configurations
```

#### B. Domain Configuration

Update `server/server.js` with your production domain:
```javascript
// Replace with your production domain
if (host === "your-domain.com") {
  return res.redirect(301, "https://www.your-domain.com" + req.originalUrl);
}
```

#### C. Deployment Platforms

**Render** (Recommended):
- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploy on commits

***<small>(Paid plan recommended.  Free-tier Render apps spin down after 15 minutes of inactivity.  If the free-tier is your only option, consider using a free service, such as https://cron-job.org to send and http request to your Render URL every 10 min or so, to keep it from spinning down.)</small>***

**Other Options**:
- **Heroku**: Use Heroku CLI or GitHub integration
- **DigitalOcean**: App Platform or Droplets
- **Railway**: Simple deployment with GitHub integration

#### D. CORS Configuration

Update `server/server.js` for production domains:
```javascript
const allowedOrigins = [
  "https://www.your-domain.com",
  "https://your-domain.com",
  // Add additional domains as needed
];
```

## Web Component Usage

The reusable inquiry form component can be embedded on any website:

### Basic Implementation
```html
<!-- Include the component script -->
<script src="https://your-domain.com/web-inquiry-form/web-inquiry-form.js" defer></script>

<!-- Use the component -->
<web-inquiry-form api-url="https://your-api-domain.com/api/leads"></web-inquiry-form>
```

### Themed Implementation
```html
<web-inquiry-form 
  api-url="https://your-api-domain.com/api/leads" 
  theme="dark">
</web-inquiry-form>
```

### OR

### CDN Delivery
```html
<!-- Include the component script -->
<script src="https://cdn.jsdelivr.net/gh/yourusername/devleads@main/web-inquiry-form/web-inquiry-form.js" defer></script>

<!-- Use the component -->
<web-inquiry-form api-url="https://your-api-domain.com/api/leads"></web-inquiry-form>
```

## Optional: YP-Scraper Integration (recommended)

Enhance lead generation with automated business data collection:

1. **Deploy YP-Scraper**
   - Repository: https://github.com/DevManSam777/yp_scraper
   - Deploy as separate Docker service
   - Update `hitlists.html` with your scraper URL

2. **Integration Benefits**
   - Bulk business data import via JSON
   - Automated prospect research
   - Enhanced hitlist management

3. **Configuration**
   ```html
   <!-- Update in hitlists.html -->
   <yp-scraper src="https://your-scraper-url.com/" defer></yp-scraper>
   ```

## Application Architecture

### Frontend Architecture
- **Modular JavaScript**: ES6 modules with clear separation of concerns
- **Component-Based**: Reusable components for forms, modals, and charts
- **State Management**: Event-driven updates with custom events
- **Responsive Design**: Mobile-first with CSS Grid and Flexbox

### Backend Architecture
- **RESTful API**: Organized route handlers with proper HTTP methods
- **Middleware**: Authentication, CORS, error handling
- **Database Models**: Mongoose schemas with validation
- **Security**: Firebase Authentication with role-based access

### Data Flow
1. **Authentication**: Firebase handles user auth with JWT tokens
2. **API Requests**: Authenticated requests to Express backend
3. **Database**: MongoDB Atlas for persistent storage
4. **Real-time Updates**: Event-driven UI updates
5. **Analytics**: Chart.js for data visualization

### Key Dependencies
- **Frontend**: Chart.js, CodeMirror, Marked.js, DOMPurify, Cleave.js
- **Backend**: Express, Mongoose, Firebase Admin SDK
- **Authentication**: Firebase Authentication
- **Database**: MongoDB Atlas
- **Email**: Nodemailer (optional)

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failures**
```bash
# Test connection string in MongoDB Compass
# Verify network access settings
# Check username/password credentials
```

**2. Firebase Authentication Issues**
- Verify `authApi.js` configuration matches Firebase Console
- Check authorized domains in Firebase Console
- Ensure Authentication is enabled

**3. Email Notifications Not Working**
- Verify SMTP settings are correct
- Use app-specific passwords, not account passwords
- Test credentials with email client first

**4. CORS Errors**
```javascript
// Check server/server.js CORS configuration
const allowedOrigins = [
  "http://localhost:5000",  // Development
  "https://your-domain.com"  // Production
];
```

**5. Form Submissions Failing**
- Verify API endpoint URLs in web component
- Check browser console for error messages
- Test API endpoints with Postman

**6. Charts Not Displaying**
- Check browser console for JavaScript errors
- Verify Chart.js is loading properly
- Ensure data format matches chart requirements

### Development Tips

- **Auto-restart**: Use `npm run dev` for automatic server restart
- **Database Inspection**: Use MongoDB Compass for direct database access
- **API Testing**: Test endpoints with Postman or Thunder Client
- **Error Monitoring**: Check both browser and server console logs
- **Authentication Testing**: Test auth flow in incognito mode

### Performance Optimization

- **Database Indexing**: Add indexes for frequently queried fields
- **Image Optimization**: Optimize images for faster loading
- **Caching**: Implement caching for static assets
- **Pagination**: Use appropriate page sizes for large datasets

## Project Structure

```
devleads/
├── .env                          # Environment variables (create this)
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
├── server/                       # Backend application
│   ├── config/
│   │   └── db.js                # Database connection
│   ├── controllers/             # Route handlers
│   │   ├── leadController.js    # Lead CRUD operations
│   │   ├── formController.js    # Form template management
│   │   ├── paymentController.js # Payment processing
│   │   ├── hitlistController.js # Business hitlist management
│   │   └── documentController.js # Document management
│   ├── models/                  # MongoDB schemas
│   │   ├── Lead.js             # Lead data model
│   │   ├── Form.js             # Form template model
│   │   ├── Payment.js          # Payment model
│   │   ├── Hitlist.js          # Hitlist model
│   │   └── Business.js         # Business model
│   ├── routes/                  # API route definitions
│   ├── middleware/
│   │   └── auth.js             # Firebase authentication middleware
│   ├── utils/
│   │   ├── emailNotification.js # Email functionality
│   │   └── seeder.js           # Database seeding utilities
│   ├── data/
│   │   └── formSeeds.js        # Default form templates
│   ├── package.json            # Server dependencies
│   └── server.js               # Main server file
├── dashboard/                   # Frontend application
│   ├── html/                   # Dashboard pages
│   │   ├── dashboard.html      # Main dashboard
│   │   ├── forms.html          # Form template manager
│   │   ├── hitlists.html       # Business hitlists
│   │   ├── resources.html      # Resources page
│   │   ├── settings.html       # User settings
│   │   └── index.html          # Login page
│   ├── css/                    # Stylesheets
│   │   ├── theme.css           # Theme variables
│   │   ├── components.css      # Reusable components
│   │   ├── dashboard.css       # Dashboard styles
│   │   ├── forms.css           # Form styles
│   │   ├── hitlist.css         # Hitlist styles
│   │   ├── resources.css       # Resources styles
│   │   ├── settings.css        # Settings styles
│   │   ├── login.css           # Login styles
│   │   ├── charts.css          # Chart styles
│   │   └── pagination.css      # Pagination styles
│   ├── js/                     # JavaScript modules
│   │   ├── api.js              # API communication layer
│   │   ├── authApi.js          # Update Firebase config here
│   │   ├── ui.js               # UI rendering functions
│   │   ├── utils.js            # Utility functions
│   │   ├── handlers.js         # Event handlers
│   │   ├── dashboard.js        # Main dashboard logic
│   │   ├── forms.js            # Form management
│   │   ├── hitlists.js         # Hitlist management
│   │   ├── payments.js         # Payment handling
│   │   ├── documents.js        # Document management
│   │   ├── leadForms.js        # Lead-specific forms
│   │   ├── charts.js           # Chart generation
│   │   ├── pagination.js       # Pagination logic
│   │   ├── settings.js         # Settings management
│   │   ├── resources.js        # Resources page
│   │   ├── login.js            # Login functionality
│   │   └── yp-scraper.js       # YP Scraper component
│   └── assets/                 # Static assets
└── web-inquiry-form/           # Reusable web component
    ├── web-inquiry-form.js     # Web component code
    ├── web-inquiry-form.html   # Demo page
    └── WEB_INQUIRY_FORM.md     # Component documentation
```

## Next Steps

1. **Complete Setup**: Follow this guide step-by-step
2. **Test Functionality**: Verify all features work in development
3. **Customize Branding**: Update colors, logos, and messaging
4. **Configure Forms**: Create custom form templates
5. **Deploy to Production**: Choose hosting platform and deploy
6. **Set Up Monitoring**: Implement logging and error tracking
7. **Backup Strategy**: Ensure regular database backups


## Support & Documentation

- **Setup Issues**: Review troubleshooting section above
- **Feature Documentation**: Check individual `.md` files in each directory
- **Component Usage**: See `web-inquiry-form/WEB_INQUIRY_FORM.md`
- **Email Setup**: Detailed guide in `server/utils/EMAIL_FORWARDING.md`
- **Browser Compatibility**: Modern browsers with ES6 module support

For technical issues:
1. Check browser console and server logs
2. Verify environment variables are set correctly
3. Test individual components separately
4. Review network requests in browser DevTools