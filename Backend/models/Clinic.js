const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  operatingHours: { type: String }, // e.g., JSON string or structured object
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  primaryVetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian', required: true },
  description: { type: String }
});

clinicSchema.index({ location: '2dsphere' }); // For geo queries

module.exports = mongoose.model('Clinic', clinicSchema);