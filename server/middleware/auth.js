// server/middleware/auth.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require('../config/serviceAccountKey.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
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