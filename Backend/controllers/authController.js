// controllers/authController.js
const PetOwner = require('../models/PetOwner');
const Veterinarian = require('../models/Veterinarian');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
  try {
    const { email, password, userType: requestedUserType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Login attempt: ${normalizedEmail}, Requested type: ${requestedUserType}`);

    // If userType is specified in request, only check that collection
    if (requestedUserType === 'vet') {
      // Only check Veterinarian collection
      let user = await Veterinarian.findOne({ 
        email: normalizedEmail,
        status: 'Active'
      }).populate('currentActiveClinicId', 'name address phoneNumber');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'No active veterinarian found with this email' 
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate vet token
      const token = generateToken({
        id: user._id,
        userType: 'Veterinarian',
        email: user.email,
        role: 'vet'
      });

      const responseUser = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: 'vet',
        phoneNumber: user.phoneNumber || null,
        address: user.address || null,
        accessLevel: user.accessLevel || null,
        currentActiveClinicId: user.currentActiveClinicId || null,
        clinicId: user.currentActiveClinicId || null,
        isPrimaryVet: user.isPrimaryVet || false,
        ownedClinics: user.ownedClinics || []
      };

      if (user.currentActiveClinicId && typeof user.currentActiveClinicId === 'object') {
        responseUser.clinic = {
          id: user.currentActiveClinicId._id,
          name: user.currentActiveClinicId.name,
          address: user.currentActiveClinicId.address,
          phoneNumber: user.currentActiveClinicId.phoneNumber
        };
      }

      return res.status(200).json({
        success: true,
        message: 'Veterinarian login successful',
        token,
        user: responseUser
      });

    } else if (requestedUserType === 'owner') {
      // Only check PetOwner collection
      let user = await PetOwner.findOne({ email: normalizedEmail });
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'No pet owner found with this email' 
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate owner token
      const token = generateToken({
        id: user._id,
        userType: 'PetOwner',
        email: user.email,
        role: 'owner'
      });

      const responseUser = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: 'owner',
        phoneNumber: user.phoneNumber || null,
        address: user.address || null
      };

      return res.status(200).json({
        success: true,
        message: 'Pet owner login successful',
        token,
        user: responseUser
      });

    } else {
      // Auto-detect (backward compatibility)
      let user = await PetOwner.findOne({ email: normalizedEmail });
      let userType = 'PetOwner';
      let role = 'owner';

      if (!user) {
        user = await Veterinarian.findOne({ 
          email: normalizedEmail,
          status: 'Active'
        }).populate('currentActiveClinicId', 'name address phoneNumber');
        userType = 'Veterinarian';
        role = 'vet';
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken({
        id: user._id,
        userType: userType,
        email: user.email,
        role: role
      });

      const responseUser = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role,
        phoneNumber: user.phoneNumber || null,
        address: user.address || null
      };

      if (userType === 'Veterinarian') {
        responseUser.accessLevel = user.accessLevel || null;
        responseUser.currentActiveClinicId = user.currentActiveClinicId || null;
        responseUser.clinicId = user.currentActiveClinicId || null;
        responseUser.isPrimaryVet = user.isPrimaryVet || false;
        responseUser.ownedClinics = user.ownedClinics || [];
        
        if (user.currentActiveClinicId && typeof user.currentActiveClinicId === 'object') {
          responseUser.clinic = {
            id: user.currentActiveClinicId._id,
            name: user.currentActiveClinicId.name,
            address: user.currentActiveClinicId.address,
            phoneNumber: user.currentActiveClinicId.phoneNumber
          };
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: responseUser
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login', 
      error: error.message 
    });
  }
};

// Get current logged-in user profile
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    let user = await PetOwner.findById(req.user.id)
      .select('-passwordHash -__v');

    let role = 'owner';

    if (!user) {
      user = await Veterinarian.findById(req.user.id)
        .select('-passwordHash -__v')
        .populate('clinicId', 'name address phoneNumber');
      role = 'vet';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build response (unchanged)
    const responseUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      address: user.address || null,
      role,
    };

    if (role === 'vet') {
      responseUser.accessLevel = user.accessLevel || null;
      responseUser.clinicId = user.clinicId?._id || null;
      responseUser.isPrimaryVet = user.isPrimaryVet || false;
      responseUser.clinic = user.clinicId ? {
        name: user.clinicId.name,
        address: user.clinicId.address,
        phoneNumber: user.clinicId.phoneNumber
      } : null;
    }

    res.status(200).json({ user: responseUser });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
};