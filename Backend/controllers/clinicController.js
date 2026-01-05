const Clinic = require('../models/Clinic');
const Veterinarian = require('../models/Veterinarian');
const ClinicStaff = require('../models/ClinicStaff');
const bcrypt = require('bcryptjs');

// Create a new clinic (typically done by a Primary Vet)
// Create a new clinic (authenticated vet automatically becomes Primary Vet)
exports.createClinic = async (req, res) => {
  try {
    const {
      name,
      address,
      phoneNumber,
      operatingHours,
      location,
      description
    } = req.body;

    // Basic validation
    if (!name || !address || !phoneNumber) {
      return res.status(400).json({
        message: 'Name, address, and phone number are required'
      });
    }

    // Validate location format if provided
    if (location && (!location.type || !Array.isArray(location.coordinates) || location.type !== 'Point')) {
      return res.status(400).json({
        message: 'Location must be a valid GeoJSON Point: { type: "Point", coordinates: [lng, lat] }'
      });
    }

    // The logged-in vet becomes the Primary Vet
    const primaryVetId = req.user.id;

    const clinic = new Clinic({
      name: name.trim(),
      address: address.trim(),
      phoneNumber: phoneNumber.trim(),
      operatingHours: operatingHours?.trim() || '',
      description: description?.trim() || '',
      location: location || { type: 'Point', coordinates: [0, 0] },
      primaryVetId
    });

    await clinic.save();

    // Optional: Update the vet's clinicId
    await Veterinarian.findByIdAndUpdate(primaryVetId, { clinicId: clinic._id });

    res.status(201).json({
      message: 'Clinic created successfully',
      clinic
    });
  } catch (error) {
    console.error('Error creating clinic:', error);
    res.status(400).json({
      message: 'Error creating clinic',
      error: error.message
    });
  }
};

exports.getMyClinic = async (req, res) => {
  try {
    console.log('=== getMyClinic called ===');
    console.log('req.user:', req.user);

    if (!req.user || !req.user.id) {
      return res.status(200).json({ clinics: [] });
    }

    const vetId = req.user.id;

    // Now Veterinarian is defined!
    const vet = await Veterinarian.findById(vetId).select('clinicId accessLevel');
    if (!vet || !vet.clinicId) {
      return res.status(200).json({ clinics: [] });
    }

    const clinic = await Clinic.findById(vet.clinicId)
      .populate('primaryVetId', 'firstName lastName');

    if (!clinic) {
      return res.status(200).json({ clinics: [] });
    }

    res.status(200).json({
      clinics: [clinic]
    });
  } catch (error) {
    console.error('Error in getMyClinic:', error);
    res.status(500).json({
      message: 'Error fetching your clinic',
      error: error.message
    });
  }
};

// Get nearby clinics based on user's location
exports.getNearbyClinics = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        message: 'Longitude (lng) and latitude (lat) are required'
      });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const distance = parseInt(maxDistance, 10);

    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({
        message: 'Invalid coordinates: lng and lat must be numbers'
      });
    }

    const clinics = await Clinic.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance // in meters
        }
      }
    }).select('-__v'); // Exclude version key

    res.status(200).json({
      count: clinics.length,
      clinics
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching nearby clinics',
      error: error.message
    });
  }
};

// Get a single clinic by ID
exports.getClinicById = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findById(id)
      .populate('primaryVetId', 'firstName lastName email phoneNumber specialization');

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.status(200).json(clinic);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching clinic',
      error: error.message
    });
  }
};

// Update clinic details (only allowed for Primary or Full Access vets)
exports.updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating primaryVetId carelessly
    if (updates.primaryVetId) {
      return res.status(403).json({
        message: 'Changing primary vet is not allowed through this endpoint'
      });
    }

    // Validate location if being updated
    if (updates.location) {
      if (!updates.location.type || !updates.location.coordinates || updates.location.type !== 'Point') {
        return res.status(400).json({
          message: 'Location must be a valid GeoJSON Point'
        });
      }
    }

    const clinic = await Clinic.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.status(200).json({
      message: 'Clinic updated successfully',
      clinic
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error updating clinic',
      error: error.message
    });
  }
};

// Delete a clinic (dangerous operation – usually restricted to Primary Vet)
exports.deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByIdAndDelete(id);

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    // Optional: Later, cascade delete or restrict if pets/staff are linked

    res.status(200).json({
      message: 'Clinic deleted successfully',
      clinic
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting clinic',
      error: error.message
    });
  }
};

// Search clinics by name or address (useful for manual search)
exports.searchClinics = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters'
      });
    }

    const regex = new RegExp(query.trim(), 'i'); // Case-insensitive

    const clinics = await Clinic.find({
      $or: [
        { name: regex },
        { address: regex }
      ]
    }).select('name address phoneNumber location');

    res.status(200).json({
      count: clinics.length,
      clinics
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching clinics',
      error: error.message
    });
  }
};

// Get all clinics (for admin dashboard or listing)
exports.getAllClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find()
      .populate('primaryVetId', 'firstName lastName')
      .sort({ name: 1 });

    res.status(200).json({
      count: clinics.length,
      clinics
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching all clinics',
      error: error.message
    });
  }
};

// Unified endpoint: Add either a Veterinarian (sub-account) or non-vet ClinicStaff
exports.addClinicStaff = async (req, res) => {
  try {
    const {
      staffType,           // Required: 'veterinarian' or any other value
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      veterinaryId,        // Required only for veterinarian
      specialization,      // Optional for veterinarian
      accessLevel,         // For veterinarian: 'Normal Access' or 'Full Access'
      role                 // For non-vet: e.g., 'Receptionist', 'Vet Tech', 'Manager'
    } = req.body;

    console.log(req.user.role);
    
    // === 1. Authentication & Role Check ===
    if (!req.user || req.user.role !== 'vet') {
      return res.status(403).json({
        message: 'Access denied: Only veterinarians can add staff'
      });
    }

    // Find the creator (logged-in vet)
    const creator = await Veterinarian.findById(req.user.id);

    if (!creator) {
      return res.status(404).json({
        message: 'Your veterinarian account was not found'
      });
    }

    // Only Primary or Full Access vets can add staff
    if (!['Primary', 'Full Access'].includes(creator.accessLevel)) {
      return res.status(403).json({
        message: 'Permission denied: Only Primary or Full Access veterinarians can add staff'
      });
    }

    // Ensure creator has a clinic
    if (!creator.clinicId) {
      return res.status(400).json({
        message: 'You are not associated with any clinic'
      });
    }

    // === 2. Basic Validation ===
    if (!staffType || !firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'firstName, lastName, email, password, and staffType are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // === 3. Add Veterinarian Sub-Account ===
    if (staffType === 'veterinarian') {
      if (!veterinaryId?.trim()) {
        return res.status(400).json({
          message: 'Veterinary License ID is required for veterinarians'
        });
      }

      // Prevent creating another Primary Vet
      if (accessLevel === 'Primary') {
        return res.status(403).json({
          message: 'Cannot create another Primary Veterinarian via sub-account'
        });
      }

      // Check for duplicate email or license
      const existingVet = await Veterinarian.findOne({
        $or: [
          { email: normalizedEmail },
          { veterinaryId: veterinaryId.trim() }
        ]
      });

      if (existingVet) {
        return res.status(409).json({
          message: 'A veterinarian with this email or license ID already exists'
        });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const newVet = new Veterinarian({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        passwordHash,
        phoneNumber: phoneNumber?.trim() || '',
        veterinaryId: veterinaryId.trim(),
        specialization: specialization?.trim() || '',
        clinicId: creator.clinicId,
        accessLevel: accessLevel || 'Normal Access',
        isPrimaryVet: false,
        createdByVetId: creator._id,
        status: 'Active'
      });

      await newVet.save();

      const response = newVet.toObject();
      delete response.passwordHash;

      return res.status(201).json({
        message: 'Veterinarian added successfully',
        staff: response
      });
    }

    // === 4. Add Non-Veterinarian Clinic Staff ===
    if (!role) {
      return res.status(400).json({
        message: 'Role is required for non-veterinarian staff'
      });
    }

    // Check for duplicate email in ClinicStaff
    const existingStaff = await ClinicStaff.findOne({ email: normalizedEmail });
    if (existingStaff) {
      return res.status(409).json({
        message: 'A staff member with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Map role to access level
    let staffAccessLevel = 'Basic';
    if (role === 'Manager') staffAccessLevel = 'Admin';
    else if (role === 'Vet Tech') staffAccessLevel = 'Moderate';

    const newStaff = new ClinicStaff({
      clinicId: creator.clinicId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      phoneNumber: phoneNumber?.trim() || '',
      role,
      accessLevel: staffAccessLevel,
      createdBy: creator._id,
      status: 'Active'
    });

    await newStaff.save();

    const response = newStaff.toObject();
    delete response.passwordHash;

    return res.status(201).json({
      message: `${role} added successfully`,
      staff: response
    });

  } catch (error) {
    console.error('Error in addClinicStaff:', error);
    res.status(500).json({
      message: 'Error adding staff member',
      error: error.message
    });
  }
};

// Get all staff members (vets + non-vet staff) for the logged-in vet's clinic
exports.getClinicStaff = async (req, res) => {
  try {
    // === 1. Authentication & Role Check ===
    if (!req.user || req.user.role !== 'vet') {
      return res.status(403).json({
        message: 'Access denied: Only veterinarians can view clinic staff'
      });
    }

    const vet = await Veterinarian.findById(req.user.id);
    if (!vet || !vet.clinicId) {
      return res.status(400).json({
        message: 'You are not associated with any clinic'
      });
    }

    const clinicId = vet.clinicId;

    // === 2. Fetch Veterinarians ===
    const vets = await Veterinarian.find({
      clinicId,
      status: 'Active'
    })
      .select('firstName lastName email phoneNumber veterinaryId specialization accessLevel isPrimaryVet createdAt')
      .sort({ isPrimaryVet: -1, accessLevel: -1, firstName: 1 });

    // === 3. Fetch Non-Vet Clinic Staff ===
    const staff = await ClinicStaff.find({
      clinicId,
      status: 'Active'
    })
      .select('firstName lastName email phoneNumber role accessLevel createdAt')
      .sort({ role: 1, firstName: 1 });

    // === 4. Format unified response ===
    const formattedVets = vets.map(v => ({
      _id: v._id,
      type: 'Veterinarian',
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phoneNumber: v.phoneNumber || 'N/A',
      details: {
        licenseId: v.veterinaryId || 'N/A',
        specialization: v.specialization || 'General',
        accessLevel: v.accessLevel,
        isPrimary: v.isPrimaryVet
      },
      createdAt: v.createdAt
    }));

    const formattedStaff = staff.map(s => ({
      _id: s._id,
      type: 'Clinic Staff',
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phoneNumber: s.phoneNumber || 'N/A',
      details: {
        role: s.role,
        accessLevel: s.accessLevel
      },
      createdAt: s.createdAt
    }));

    // Combine and sort by creation date (newest first)
    const allStaff = [...formattedVets, ...formattedStaff]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      message: 'Clinic staff retrieved successfully',
      total: allStaff.length,
      staff: allStaff
    });

  } catch (error) {
    console.error('Error in getClinicStaff:', error);
    res.status(500).json({
      message: 'Error fetching clinic staff',
      error: error.message
    });
  }
};

// Get ONLY the total count of active clinic staff (vets + non-vet staff)
// Fast and lightweight — ideal for dashboard stats
exports.getClinicStaffCount = async (req, res) => {
  try {
    const { clinicId } = req.params;

    // === Security: Only allow vets from this clinic ===
    if (!req.user || req.user.role !== 'vet') {
      return res.status(403).json({
        message: 'Access denied: Only veterinarians can access this data'
      });
    }

    const vet = await Veterinarian.findById(req.user.id);
    if (!vet || !vet.clinicId || vet.clinicId.toString() !== clinicId) {
      return res.status(403).json({
        message: 'You do not have permission to view staff stats for this clinic'
      });
    }

    // Optional: Verify clinic exists
    const clinicExists = await Clinic.findById(clinicId);
    if (!clinicExists) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    // Count active veterinarians
    const vetCount = await Veterinarian.countDocuments({
      clinicId,
      status: 'Active'
    });

    // Count active non-vet staff
    const staffCount = await ClinicStaff.countDocuments({
      clinicId,
      status: 'Active'
    });

    const totalStaff = vetCount + staffCount;

    res.status(200).json({
      message: 'Clinic staff count retrieved successfully',
      clinicId,
      totalStaff,
      breakdown: {
        veterinarians: vetCount,
        nonVetStaff: staffCount
      }
    });

  } catch (error) {
    console.error('Error in getClinicStaffCount:', error);
    res.status(500).json({
      message: 'Error fetching clinic staff count',
      error: error.message
    });
  }
};