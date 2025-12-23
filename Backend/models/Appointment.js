const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetProfile', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian', required: true },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['Booked', 'Confirmed', 'Rescheduled', 'Canceled', 'Completed'], default: 'Booked' },
  reason: { type: String },
  notes: { type: String }
});

module.exports = mongoose.model('Appointment', appointmentSchema);