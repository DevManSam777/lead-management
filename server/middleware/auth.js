// // server/middleware/auth.js
// const admin = require('firebase-admin');

// // Initialize Firebase Admin SDK
// try {
//   const serviceAccount = require('../config/serviceAccountKey.json');
  
//   if (!admin.apps.length) {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//     console.log('Firebase Admin SDK initialized successfully');
//   }
// } catch (error) {
//   console.error('Error initializing Firebase Admin SDK:', error);
// }

// const auth = async (req, res, next) => {
//   console.log('Auth middleware running');
  
//   try {
//     // Get token from Authorization header
//     const token = req.headers.authorization?.split('Bearer ')[1];
    
//     if (!token) {
//       console.log('No authentication token provided');
//       return res.status(401).json({ message: 'No authentication token provided' });
//     }
    
//     // Verify the token
//     console.log('Verifying token...');
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     console.log('Token verified for user:', decodedToken.uid);
    
//     // Add user info to request
//     req.user = decodedToken;
    
//     // Continue to the next middleware/route handler
//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     return res.status(403).json({ message: 'Authentication failed: Invalid token' });
//   }
// };

// module.exports = auth;

// server/middleware/auth.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Use environment variables instead of JSON file
    const firebaseConfig = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
    };
    
    // Check if all required environment variables are present
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig)
    });
    console.log('Firebase Admin SDK initialized successfully with environment variables');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.error('Please check your environment variables and try again');
  }
}

const auth = async (req, res, next) => {
  console.log('Auth middleware running');
  
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      console.log('No authentication token provided');
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    
    // Verify the token
    console.log('Verifying token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Token verified for user:', decodedToken.uid);
    
    // Add user info to request
    req.user = decodedToken;
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Authentication failed: Invalid token' });
  }
};

module.exports = auth;