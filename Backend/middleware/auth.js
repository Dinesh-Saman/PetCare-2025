// middleware/auth.js - Fix the populate issue
const jwt = require('jsonwebtoken');
const PetOwner = require('../models/PetOwner');
const Veterinarian = require('../models/Veterinarian');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Protect routes - verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('=== AUTH MIDDLEWARE START ===');
  console.log('Token exists:', !!token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', decoded);

    const userId = decoded.id || decoded._id;
    let userType = decoded.userType;
    let tokenRole = decoded.role; // Check role from token
    
    console.log('User ID from token:', userId);
    console.log('User Type from token:', userType);
    console.log('Role from token:', tokenRole);

    if (!userId) {
      console.error('No user ID found in token');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token: no user ID' 
      });
    }

    // If no userType in token, try to determine it
    if (!userType) {
      console.log('No userType in token, trying to determine...');
      
      // Try Veterinarian first
      let user = await Veterinarian.findById(userId).select('-passwordHash');
      if (user) {
        userType = 'Veterinarian';
        console.log('Found user as Veterinarian');
      } else {
        // Try PetOwner
        user = await PetOwner.findById(userId).select('-passwordHash');
        if (user) {
          userType = 'PetOwner';
          console.log('Found user as PetOwner');
        }
      }
      
      if (!userType) {
        console.error('Could not find user in either collection');
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }
    }

    // Fetch user
    let user;
    if (userType === 'PetOwner') {
      user = await PetOwner.findById(userId).select('-passwordHash');
      console.log('Fetched PetOwner:', user ? 'Found' : 'Not found');
    } else if (userType === 'Veterinarian') {
      // Try to populate currentActiveClinicId instead of clinicId
      try {
        user = await Veterinarian.findById(userId)
          .select('-passwordHash')
          .populate('currentActiveClinicId', 'name address phoneNumber');
        console.log('Fetched Veterinarian with currentActiveClinicId populate:', user ? 'Found' : 'Not found');
      } catch (populateError) {
        console.log('Populate failed, fetching without populate:', populateError.message);
        // Fallback: fetch without populate
        user = await Veterinarian.findById(userId).select('-passwordHash');
        console.log('Fetched Veterinarian without populate:', user ? 'Found' : 'Not found');
      }
    }

    if (!user) {
      console.error(`User not found for ID: ${userId}, Type: ${userType}`);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, user not found' 
      });
    }

    // Check if veterinarian is active
    if (userType === 'Veterinarian' && user.status !== 'Active') {
      console.error('Veterinarian is not active:', user.status);
      return res.status(401).json({ 
        success: false,
        message: 'Account is not active. Please contact administrator.' 
      });
    }

    // Determine role - IMPORTANT: Use token role if available, otherwise determine from userType
    let role;
    if (tokenRole) {
      role = tokenRole;
      console.log('Using role from token:', role);
    } else {
      role = userType === 'PetOwner' ? 'owner' : 'vet';
      console.log('Determined role from userType:', role);
    }
    
    console.log('Final user role:', role);

    // Build user object for request
    req.user = {
      id: user._id,
      email: user.email,
      role: role,
      userType: userType
    };

    // Add vet-specific fields
    if (role === 'vet') {
      req.user.accessLevel = user.accessLevel || null;
      
      // Use currentActiveClinicId instead of clinicId
      if (user.currentActiveClinicId) {
        if (typeof user.currentActiveClinicId === 'object') {
          // currentActiveClinicId is populated
          req.user.clinicId = user.currentActiveClinicId._id;
          req.user.clinic = {
            id: user.currentActiveClinicId._id,
            name: user.currentActiveClinicId.name,
            address: user.currentActiveClinicId.address,
            phoneNumber: user.currentActiveClinicId.phoneNumber
          };
        } else {
          // currentActiveClinicId is just an ObjectId
          req.user.clinicId = user.currentActiveClinicId;
        }
      } else {
        req.user.clinicId = null;
      }
      
      req.user.currentActiveClinicId = user.currentActiveClinicId || null;
      req.user.isPrimaryVet = user.isPrimaryVet || false;
      req.user.ownedClinics = user.ownedClinics || [];
      
      console.log('Vet clinic info:', req.user.clinic);
    }



    
    next();
  } catch (error) {
    console.error('=== AUTH MIDDLEWARE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token signature' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }

    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed',
      error: error.message 
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check - User:', req.user?.id, 'Role:', req.user?.role);
    console.log('Required roles:', roles);

    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    console.log('Authorization passed');
    next();
  };
};

// Rest of your auth.js...

// Authorize vet access levels (Primary, Full Access, Normal Access)
exports.authorizeVetAccess = (...levels) => {
  return (req, res, next) => {
    if (req.user.role !== 'vet') {
      return res.status(403).json({ 
        success: false,
        message: 'Vet access required' 
      });
    }

    if (!levels.includes(req.user.accessLevel)) {
      return res.status(403).json({
        success: false,
        message: `Vet access denied: requires ${levels.join(' or ')} access level`
      });
    }

    next();
  };
};

// Middleware: Ensure vet belongs to the clinic requested for the pet
const authorizeVetForClinicFromPet = async (req, res, next) => {
  try {
    const { id } = req.params; // petId

    const pet = await PetProfile.findById(id);

    if (!pet) {
      return res.status(404).json({ 
        success: false,
        message: 'Pet not found' 
      });
    }

    if (!pet.registeredClinicId) {
      return res.status(400).json({ 
        success: false,
        message: 'This pet has no clinic registration request' 
      });
    }

    if (req.user.role !== 'vet' || !req.user.clinicId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: Veterinarian access required'
      });
    }

    // Check if vet's clinic matches pet's registered clinic
    const vetClinicId = req.user.clinicId.toString();
    const petClinicId = pet.registeredClinicId.toString();

    if (vetClinicId !== petClinicId) {
      console.log(`Clinic mismatch - Vet: ${vetClinicId}, Pet: ${petClinicId}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized: This pet registration request is not for your clinic'
      });
    }

    req.pet = pet;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error in vet clinic authorization', 
      error: error.message 
    });
  }
};

module.exports = {
  protect: exports.protect,
  authorize: exports.authorize,
  authorizeVetAccess: exports.authorizeVetAccess,
  authorizeVetForClinicFromPet
};