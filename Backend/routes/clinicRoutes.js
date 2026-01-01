// clinicRoutes.js

const express = require('express');
const router = express.Router();
const {
  createClinic,
  getNearbyClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  searchClinics,
  getAllClinics,
  getMyClinic,
  getClinicStaff,     // ← your new method
  addClinicStaff
} = require('../controllers/clinicController');

const { protect, authorize, authorizeVetAccess } = require('../middleware/auth');

// === Public Routes ===
router.get('/nearby', getNearbyClinics);
router.get('/search', searchClinics);
router.get('/', getAllClinics);

// === Protected Vet Routes ===
router.get('/my', protect, authorize('vet'), getMyClinic);

// STAFF ROUTES - MUST COME BEFORE /:id !!!
router.get('/staff', protect, authorize('vet'), authorizeVetAccess('Primary', 'Full Access'), getClinicStaff);
router.post('/staff', protect, authorize('vet'), authorizeVetAccess('Primary', 'Full Access'), addClinicStaff);

// === Clinic CRUD - :id routes LAST ===
router.get('/:id', getClinicById);                    // Now only matches real ObjectIds
//router.put('/:id', protect, authorize('vet'), authorizeClinicPrimaryVet, updateClinic);
//router.delete('/:id', protect, authorize('vet'), authorizeClinicPrimaryVet, deleteClinic);

router.post('/', protect, authorize('vet'), createClinic);

module.exports = router;