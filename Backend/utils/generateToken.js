// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  // For backward compatibility, check if user is an object or just an ID
  let payload;
  
  if (typeof user === 'object') {
    // New format: user object with id and userType
    payload = {
      id: user.id || user._id,
      userType: user.userType || (user.model || 'PetOwner'), // Explicitly store user type
      email: user.email
    };
  } else {
    // Old format: just user ID string
    // This maintains backward compatibility
    payload = {
      id: user
    };
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;