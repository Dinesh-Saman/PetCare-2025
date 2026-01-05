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
  getClinicStaff,   
  addClinicStaff,
  getClinicStaffCount
} = require('../controllers/clinicController');

const { protect, authorize, authorizeVetAccess } = require('../middleware/auth');

// === Public Routes ===
router.get('/nearby', getNearbyClinics);
router.get('/search', searchClinics);
router.get('/', getAllClinics);

// === Protected Vet Routes ===
router.get('/my', protect, getMyClinic);

// STAFF ROUTES - MUST COME BEFORE /:id !!!
router.get('/staff', protect, authorize('vet'), authorizeVetAccess('Primary', 'Full Access'), getClinicStaff);
router.post('/staff', protect, authorize('vet'), authorizeVetAccess('Primary', 'Full Access'), addClinicStaff);

// === Clinic CRUD - :id routes LAST ===
router.get('/:id', getClinicById);                    // Now only matches real ObjectIds
router.put('/:id', updateClinic);
//router.delete('/:id', protect, authorize('vet'), authorizeClinicPrimaryVet, deleteClinic);

router.post('/', protect, authorize('vet'), createClinic);

// routes/clinicRoutes.js
router.get(
  '/:clinicId/staff-count',
  protect,
  getClinicStaffCount
);

module.exports = router;