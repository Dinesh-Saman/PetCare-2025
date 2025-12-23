const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointmentsByPet,
  getAppointmentsByVet,
  getUpcomingAppointmentsByClinic,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  getAppointmentById
} = require('../controllers/appointmentController');

// Import authentication middleware
const { protect, authorize, authorizeVetAccess } = require('../middleware/auth');

// Owner can book appointments
router.post('/book', protect, authorize('owner'), bookAppointment);

// Owner can view their pet's appointments
router.get('/pet/:petId', protect, authorize('owner'), getAppointmentsByPet);

// Anyone authenticated (owner or vet) can view a single appointment (useful for details)
router.get('/:id', protect, getAppointmentById);

// Vet routes - require vet role
router.get('/vet/:vetId', protect, authorize('vet'), getAppointmentsByVet);
router.get('/clinic/:clinicId/upcoming', protect, authorize('vet'), getUpcomingAppointmentsByClinic);

// Vet actions: confirm, update (reschedule), cancel
router.put('/:id', protect, authorize('vet'), updateAppointment);
router.patch('/:id/confirm', protect, authorize('vet'), confirmAppointment);

// Allow both owner and vet to cancel (owner cancels their booking, vet can cancel on behalf)
router.patch('/:id/cancel', protect, (req, res, next) => {
  // Custom logic: allow owner if they own the pet, or vet if in same clinic
  // We'll keep it simple for now: both can cancel, but you can enhance later
  if (req.user.role === 'owner' || req.user.role === 'vet') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
}, cancelAppointment);

module.exports = router;