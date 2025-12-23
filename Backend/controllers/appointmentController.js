const Appointment = require('../models/Appointment');
const PetProfile = require('../models/PetProfile');
const Clinic = require('../models/Clinic');

// Book a new appointment (Pet Owner)
exports.bookAppointment = async (req, res) => {
  try {
    const { petId, clinicId, vetId, dateTime, reason, notes } = req.body;

    // Basic validation
    if (!petId || !clinicId || !vetId || !dateTime) {
      return res.status(400).json({
        message: 'petId, clinicId, vetId, and dateTime are required'
      });
    }

    // Optional: Check if pet is registered with the clinic
    const pet = await PetProfile.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    if (pet.registeredClinicId && pet.registeredClinicId.toString() !== clinicId) {
      return res.status(403).json({
        message: 'This pet is not registered with the selected clinic'
      });
    }

    // Check for conflicting appointments (same vet, same time)
    const conflicting = await Appointment.findOne({
      vetId,
      dateTime,
      status: { $nin: ['Canceled'] }
    });

    if (conflicting) {
      return res.status(409).json({
        message: 'Vet is not available at this time'
      });
    }

    const appointment = new Appointment({
      petId,
      clinicId,
      vetId,
      dateTime: new Date(dateTime),
      reason,
      notes,
      status: 'Booked' // Default status
    });

    await appointment.save();

    // Populate useful fields before sending response
    await appointment.populate([
      { path: 'petId', select: 'name species breed' },
      { path: 'vetId', select: 'firstName lastName specialization' },
      { path: 'clinicId', select: 'name address phoneNumber' }
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error booking appointment',
      error: error.message
    });
  }
};

// Get all appointments for a specific pet (Owner or Vet view)
exports.getAppointmentsByPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { status, upcoming } = req.query; // Optional filters

    let query = { petId };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.dateTime = { $gte: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate('vetId', 'firstName lastName specialization')
      .populate('clinicId', 'name address phoneNumber')
      .sort({ dateTime: -1 }); // Most recent first

    res.status(200).json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching appointments by pet',
      error: error.message
    });
  }
};

// Get all appointments for a vet on a specific day or range
exports.getAppointmentsByVet = async (req, res) => {
  try {
    const { vetId } = req.params;
    const { date, clinicId } = req.query;

    let query = { vetId };

    if (clinicId) query.clinicId = clinicId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.dateTime = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate('petId', 'name species breed ownerId')
      .populate('clinicId', 'name')
      .sort({ dateTime: 1 });

    res.status(200).json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching vet appointments',
      error: error.message
    });
  }
};

// Get upcoming appointments for a clinic
exports.getUpcomingAppointmentsByClinic = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const appointments = await Appointment.find({
      clinicId,
      dateTime: { $gte: new Date() },
      status: { $in: ['Booked', 'Confirmed'] }
    })
      .populate('petId', 'name')
      .populate('vetId', 'firstName lastName')
      .sort({ dateTime: 1 })
      .limit(limit);

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching upcoming clinic appointments',
      error: error.message
    });
  }
};

// Update appointment (reschedule, confirm, cancel, etc.)
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If rescheduling, check for conflicts
    if (updates.dateTime) {
      const conflicting = await Appointment.findOne({
        _id: { $ne: id },
        vetId: updates.vetId || (await Appointment.findById(id)).vetId,
        dateTime: new Date(updates.dateTime),
        status: { $nin: ['Canceled'] }
      });

      if (conflicting) {
        return res.status(409).json({
          message: 'Vet is not available at the new time'
        });
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('petId vetId clinicId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// Cancel appointment (allowed by owner or vet)
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'Canceled', notes: reason ? `Cancellation reason: ${reason}` : undefined },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment canceled successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error canceling appointment',
      error: error.message
    });
  }
};

// Confirm appointment (Vet action)
exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'Confirmed' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment confirmed',
      appointment
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error confirming appointment',
      error: error.message
    });
  }
};

// Get single appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('petId', 'name species breed ownerId')
      .populate('vetId', 'firstName lastName')
      .populate('clinicId', 'name address phoneNumber');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};