const express = require('express');
const router = express.Router();
const {
  createPet,
  getPetsByOwner,
  getPetById,
  updatePet,
  deletePet,
  requestClinicRegistration,
  getPendingRegistrationsByClinic
} = require('../controllers/petProfileController');

// Import middleware
const { protect, authorize, authorizeVetAccess } = require('../middleware/auth');
const PetProfile = require('../models/PetProfile');

// Middleware: Ensure the user owns the pet (for owner actions)
const authorizePetOwner = async (req, res, next) => {
  try {
    const { id } = req.params; // petId
    const pet = await PetProfile.findById(id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized: You do not own this pet'
      });
    }

    req.pet = pet; // Attach for controller use if needed
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error in pet ownership check', error: error.message });
  }
};

// Middleware: Ensure the vet belongs to the clinic
const authorizeVetForClinic = async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    if (req.user.role !== 'vet' || req.user.clinicId?.toString() !== clinicId) {
      return res.status(403).json({
        message: 'Not authorized: You do not belong to this clinic'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error in clinic authorization', error: error.message });
  }
};

// === Owner Routes ===
// All owner actions require authentication + ownership

// Create a new pet
router.post('/', protect, authorize('owner'), createPet);

// Get all pets for the authenticated owner
// We override ownerId with req.user.id for security
router.get('/owner/:ownerId', protect, authorize('owner'), (req, res, next) => {
  if (req.params.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view other owners\' pets' });
  }
  getPetsByOwner(req, res, next);
});

// Get single pet details
router.get('/:id', protect, (req, res, next) => {
  // Allow owner if they own it, or vet if pet is registered with their clinic
  PetProfile.findById(req.params.id)
    .then(pet => {
      if (!pet) return res.status(404).json({ message: 'Pet not found' });

      const isOwner = req.user.role === 'owner' && pet.ownerId.toString() === req.user.id;
      const isVetFromClinic = req.user.role === 'vet' &&
        pet.registeredClinicId &&
        pet.registeredClinicId.toString() === req.user.clinicId;

      if (!isOwner && !isVetFromClinic) {
        return res.status(403).json({ message: 'Not authorized to view this pet' });
      }

      next();
    })
    .catch(() => res.status(500).json({ message: 'Server error' }));
}, getPetById);

// Update pet
router.put('/:id', protect, authorize('owner'), authorizePetOwner, updatePet);

// Delete pet (soft delete)
router.delete('/:id', protect, authorize('owner'), authorizePetOwner, deletePet);

// Request clinic registration
router.post('/:id/request-registration', protect, authorize('owner'), authorizePetOwner, requestClinicRegistration);

// === Vet Route ===
// View pending registrations for their clinic
router.get('/clinic/:clinicId/pending', protect, authorize('vet'), authorizeVetForClinic, getPendingRegistrationsByClinic);

// Get my own pets — clean, secure endpoint for owner
router.get('/my', protect, authorize('owner'), (req, res, next) => {
  // Force the ownerId to be the authenticated user's ID
  req.params.ownerId = req.user.id;
  // Now properly pass through to the existing controller
  getPetsByOwner(req, res, next);
});

module.exports = router;