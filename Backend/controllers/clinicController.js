const Clinic = require('../models/Clinic');

// Create a new clinic (typically done by a Primary Vet)
exports.createClinic = async (req, res) => {
  try {
    const {
      name,
      address,
      phoneNumber,
      operatingHours,
      location, // { type: 'Point', coordinates: [lng, lat] }
      description,
      primaryVetId // Should come from authenticated user or body
    } = req.body;

    // Basic validation
    if (!name || !address || !phoneNumber || !primaryVetId) {
      return res.status(400).json({
        message: 'Name, address, phone number, and primary vet are required'
      });
    }

    // Ensure location is in correct GeoJSON format
    if (location && (!location.type || !location.coordinates || location.type !== 'Point')) {
      return res.status(400).json({
        message: 'Location must be a valid GeoJSON Point: { type: "Point", coordinates: [lng, lat] }'
      });
    }

    const clinic = new Clinic({
      name,
      address,
      phoneNumber,
      operatingHours,
      location: location || { type: 'Point', coordinates: [0, 0] },
      description,
      primaryVetId
    });

    await clinic.save();

    res.status(201).json({
      message: 'Clinic created successfully',
      clinic
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error creating clinic',
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