// server/middleware/auth.js
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Check if using environment variables or service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Parse the service account JSON
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Initialize with application default credentials
      admin.initializeApp({
        projectId: 'devleads-a1329',
        apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCtxxEU1DGzGJO83lquD4biAjPlRFMzq4E',
      });
    }
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const auth = async (req, res, next) => {
  try {
    // For development/testing, bypass authentication if needed
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.log('Development mode: Auth bypassed');
      return next();
    }
    
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    
    // Get the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      // Verify token
      console.log('Verifying token...');
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Add user information to request
      req.user = decodedToken;
      console.log(`Authenticated user: ${decodedToken.email || decodedToken.uid}`);
      
      // Continue with the request
      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(403).json({ message: 'Authentication failed: Invalid token' });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth;