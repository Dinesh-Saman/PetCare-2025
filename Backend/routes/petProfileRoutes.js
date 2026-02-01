const express = require('express');
const router = express.Router();
const petController = require('../controllers/petProfileController');
const Clinic = require('../models/Clinic');
const { protect, authorize } = require('../middleware/auth');
const Veterinarian = require('../models/Veterinarian');
const PetProfile = require('../models/PetProfile');

// ===== VET ROUTES =====

// Add this test endpoint FIRST
router.get('/test-simple', protect, authorize('vet'), async (req, res) => {
  try {
    console.log('=== TEST SIMPLE ENDPOINT ===');
    console.log('User ID from token:', req.user.id);
    
    // Get veterinarian with clinic populated
    const veterinarian = await Veterinarian.findById(req.user.id);
    
    if (!veterinarian) {
      return res.status(404).json({ 
        success: false,
        message: 'Veterinarian not found' 
      });
    }
    
    // Get clinic details
    const clinic = await Clinic.findById(veterinarian.clinicId);
    
    // Return simple response
    return res.status(200).json({
      success: true,
      message: 'Test endpoint works!',
      vet: {
        id: veterinarian._id,
        name: `${veterinarian.firstName} ${veterinarian.lastName}`,
        clinicId: veterinarian.clinicId
      },
      clinic: clinic ? {
        id: clinic._id,
        name: clinic.name
      } : null
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get pending registrations for vet's clinic - SIMPLIFIED
// Get pending registrations for vet's clinic - UPDATED FOR YOUR SCHEMA
router.get('/clinic/pending', protect, authorize('vet'), async (req, res) => {
  try {
    console.log('=== /clinic/pending ===');
    console.log('User ID:', req.user.id);
    
    // Get veterinarian
    const veterinarian = await Veterinarian.findOne({ email: req.user.email });

    if (!veterinarian) {
      console.error('ERROR: Veterinarian not found');
      return res.status(404).json({ 
        success: false,
        message: 'Veterinarian not found' 
      });
    }
    
    console.log('Vet found:', veterinarian.firstName, veterinarian.lastName);
    console.log('Vet currentActiveClinicId:', veterinarian.currentActiveClinicId);
    console.log('Vet clinicId (if exists):', veterinarian.clinicId);
    console.log('All vet fields:', Object.keys(veterinarian.toObject()));
    
    // Check both possible fields
    const activeClinicId = veterinarian.currentActiveClinicId || veterinarian.clinicId;
    
    if (!activeClinicId) {
      console.error('ERROR: Veterinarian has no active clinic');
      return res.status(400).json({ 
        success: false,
        message: 'Veterinarian is not associated with any clinic' 
      });
    }
    
    console.log('Using clinicId:', activeClinicId);
    
    // Get clinic
    const clinic = await Clinic.findById(activeClinicId);
    if (!clinic) {
      console.error('ERROR: Clinic not found for ID:', activeClinicId);
      return res.status(404).json({ 
        success: false,
        message: 'Clinic not found' 
      });
    }
    
    console.log('Clinic found:', clinic.name);
    
    // Get pending pets
    const pendingPets = await PetProfile.find({
      registeredClinicId: activeClinicId,
      registrationStatus: 'Pending',
      isDeleted: { $ne: true }
    })
      .populate('ownerId', 'firstName lastName email phoneNumber')
      .populate('registeredClinicId', 'name address phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${pendingPets.length} pending pets`);
    
    // Return response
    return res.status(200).json({
      success: true,
      count: pendingPets.length,
      pendingPets: pendingPets,
      clinicInfo: {
        id: clinic._id,
        name: clinic.name,
        address: clinic.address
      }
    });
    
  } catch (error) {
    console.error('Error in /clinic/pending:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ===== OWNER ROUTES =====

// Get my own pets
router.get('/my', protect, authorize('owner'), (req, res) => {
  req.params.ownerId = req.user.id;
  return petController.getPetsByOwner(req, res);
});

// Create a new pet
router.post('/', protect, authorize('owner'), petController.createPet);

// Get all pets for owner
router.get('/owner/:ownerId', protect, authorize('owner', 'vet'), petController.getPetsByOwner);

// Get single pet details
router.get('/:id', protect, petController.getPetById);

// Update pet
router.put('/:id', protect, authorize('owner'), petController.updatePet);

// Delete pet
router.delete('/:id', protect, authorize('owner'), petController.deletePet);

// Request clinic registration
router.post('/:id/request-registration', protect, authorize('owner'), petController.requestClinicRegistration);

// ===== CLINIC ROUTES (with clinicId) =====

// Get pending registrations for clinic
router.get('/clinic/:clinicId/pending', protect, petController.getPendingRegistrationsByClinic);

// Get approved registrations for clinic
router.get('/clinic/:clinicId/approved', protect, petController.getApprovedRegistrationsByClinic);

// Get registered pets count for clinic
router.get('/clinic/:clinicId/registered-count', protect, petController.getRegisteredPetsCountByClinic);

// Get pending registrations count for clinic
router.get('/clinic/:clinicId/pending-count', protect, petController.getPendingRegistrationsCountByClinic);

// ===== REGISTRATION MANAGEMENT =====

// Approve pet registration
router.patch('/:id/approve', protect, authorize('vet'), petController.approvePetRegistration);

// Reject pet registration
router.patch('/:id/reject', protect, authorize('vet'), petController.rejectPetRegistration);

// Get registered pets for vet's current clinic
router.get('/clinic/registered', protect, authorize('vet'), petController.getRegisteredPetsForVetClinic);

module.exports = router;