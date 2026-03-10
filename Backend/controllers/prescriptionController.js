const Prescription = require('../models/Prescription');
const PetProfile = require('../models/PetProfile');
const MedicalRecord = require('../models/MedicalRecord');

// Create a new prescription or vaccination (Veterinarian only)
exports.createPrescription = async (req, res) => {
  try {
    const {
      petId,
      medicalRecordId, // Optional link to medical record
      medicationName,
      dosage,
      duration,
      instructions,
      type, // 'Medication' or 'Vaccination'
      dueDate // Required for reminders (e.g., next vaccination date)
    } = req.body;

    // Required fields validation
    if (!petId || !medicationName || !dosage || !type) {
      return res.status(400).json({
        message: 'petId, medicationName, dosage, and type are required'
      });
    }

    if (!type) {
      return res.status(400).json({
        message: 'type is required'
      });
    }

    if (type === 'Vaccination' && !dueDate) {
      return res.status(400).json({
        message: 'dueDate is required for vaccinations (next booster date)'
      });
    }

    // Verify pet exists
    const pet = await PetProfile.findById(petId).select('name registeredClinicId ownerId');
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Optional: Verify medicalRecordId belongs to this pet
    if (medicalRecordId) {
      const record = await MedicalRecord.findOne({ _id: medicalRecordId, petId });
      if (!record) {
        return res.status(404).json({ message: 'Medical record not found or does not belong to this pet' });
      }
    }

    const prescription = new Prescription({
      petId,
      medicalRecordId: medicalRecordId || null,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      duration: duration?.trim() || '',
      instructions: instructions?.trim() || '',
      type,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user.id  // ← Added here: the logged-in veterinarian
    });

    await prescription.save();

    // Populate related data
    await prescription.populate('petId', 'name species breed');
    await prescription.populate('medicalRecordId', 'date diagnosis');
    // Optional: also populate the vet who created it
    await prescription.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: `${type} prescribed successfully`,
      prescription
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error creating prescription',
      error: error.message
    });
  }
};

// Get all prescriptions/vaccinations for a pet
exports.getPrescriptionsByPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { type, activeOnly } = req.query; // Optional filters

    // Verify pet exists
    const pet = await PetProfile.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Base query: only active (non-deleted) records
    let query = {
      petId,
      isDeleted: { $ne: true }
    };

    // Filter by type if provided
    if (type && ['Medication', 'Vaccination'].includes(type)) {
      query.type = type;
    }

    // Optional: only show upcoming (dueDate in future) — mainly for vaccinations
    if (activeOnly === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      query.dueDate = { $gte: today };
    }

    const prescriptions = await Prescription.find(query)
      .populate('petId', 'name species breed photo')
      .populate({
        path: 'medicalRecordId',
        select: 'date diagnosis visibleToOwner',
        populate: {
          path: 'vetId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 }) // Most recent first — consistent and expected
    // Alternative: .sort({ dueDate: 1 }) for upcoming first

    res.status(200).json({
      count: prescriptions.length,
      prescriptions
    });

  } catch (error) {
    console.error('Error in getPrescriptionsByPet:', error);
    res.status(500).json({
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
};

// Get upcoming reminders (medications & vaccinations due soon)
exports.getUpcomingReminders = async (req, res) => {
  try {
    const { petId } = req.params;
    const { daysAhead = 30 } = req.query;

    const petExists = await PetProfile.findById(petId);
    if (!petExists) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(daysAhead));

    const upcoming = await Prescription.find({
      petId,
      dueDate: { $gte: today, $lte: futureDate },
      type: { $in: ['Medication', 'Vaccination'] }
    })
      .sort({ dueDate: 1 })
      .populate('petId', 'name photo')
      .select('medicationName type dueDate instructions');

    res.status(200).json({
      daysAhead: parseInt(daysAhead),
      count: upcoming.length,
      reminders: upcoming
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching upcoming reminders',
      error: error.message
    });
  }
};

// Get all upcoming reminders for an owner (across all their pets)
exports.getOwnerUpcomingReminders = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { daysAhead = 30 } = req.query;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(daysAhead));

    const reminders = await Prescription.aggregate([
      {
        $lookup: {
          from: 'petprofiles',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet'
        }
      },
      { $unwind: '$pet' },
      { $match: { 'pet.ownerId': ownerId } },
      {
        $match: {
          dueDate: { $gte: today, $lte: futureDate },
          type: { $in: ['Medication', 'Vaccination'] }
        }
      },
      {
        $sort: { dueDate: 1 }
      },
      {
        $project: {
          medicationName: 1,
          type: 1,
          dueDate: 1,
          instructions: 1,
          petName: '$pet.name',
          petId: '$pet._id'
        }
      }
    ]);

    res.status(200).json({
      ownerId,
      daysAhead: parseInt(daysAhead),
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching owner reminders',
      error: error.message
    });
  }
};

// Update prescription (Vet only)
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent changing petId
    if (updates.petId) {
      return res.status(400).json({ message: 'Cannot change associated pet' });
    }

    if (updates.type && !updates.type) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('petId', 'name')
      .populate('medicalRecordId', 'date');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error updating prescription',
      error: error.message
    });
  }
};

// Soft delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({
      message: 'Prescription deleted successfully (soft delete)',
      prescription
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting prescription',
      error: error.message
    });
  }
};

// Get vaccination history summary for a pet
exports.getVaccinationSummary = async (req, res) => {
  try {
    const { petId } = req.params;

    const vaccinations = await Prescription.find({
      petId,
      type: 'Vaccination'
    })
      .sort({ dueDate: -1 })
      .select('medicationName dueDate instructions createdAt');

    const nextDue = vaccinations.find(v => v.dueDate && new Date(v.dueDate) > new Date());

    res.status(200).json({
      totalVaccinations: vaccinations.length,
      nextDueVaccination: nextDue || null,
      history: vaccinations
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching vaccination summary',
      error: error.message
    });
  }
};

// Generate and stream PDF prescription
exports.generatePrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate({
        path: 'petId',
        select: 'name species breed dateOfBirth photo ownerId',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName phoneNumber email'
        }
      })
      .populate({
        path: 'medicalRecordId',
        select: 'date diagnosis vetId',
        populate: {
          path: 'vetId',
          select: 'firstName lastName'
        }
      });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const pet = prescription.petId;
    if (!pet) {
      return res.status(404).json({ message: 'Associated pet not found' });
    }

    // Install required package: npm install pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set headers for download
    const isVaccination = prescription.type === 'Vaccination';
    const reportTitle = isVaccination ? 'Pet Vaccinations' : 'Veterinary Prescription';
    const filename = `${reportTitle.replace(/ /g, '_')}_${pet.name}_${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Color Palette
    const primaryColor = '#2e7d32'; // Vet Green
    const secondaryColor = '#455a64';
    const accentColor = '#1565c0';

    // --- Header Section ---
    doc.rect(0, 0, 612, 120).fill(primaryColor);
    doc.fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text(reportTitle.toUpperCase(), 50, 45);

    doc.fontSize(10)
      .font('Helvetica')
      .text('OFFICIAL MEDICAL RECORD', 50, 80);

    // --- Content Start ---
    doc.fillColor('#000000').moveDown(6);

    // Row 1: Pet & Owner Info
    const startY = 160;
    doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('PET INFORMATION', 50, startY);
    doc.fontSize(14).font('Helvetica-Bold').text('OWNER INFORMATION', 320, startY);

    doc.rect(50, startY + 20, 240, 1).fill(primaryColor);
    doc.rect(320, startY + 20, 240, 1).fill(primaryColor);

    doc.fillColor('#333333').fontSize(11).font('Helvetica').moveDown(1.5);

    // Pet details
    let currentY = startY + 35;
    doc.text(`Name:`, 50, currentY, { continued: true }).font('Helvetica-Bold').text(` ${pet.name}`);
    doc.font('Helvetica').text(`Species:`, 50, currentY + 18, { continued: true }).font('Helvetica-Bold').text(` ${pet.species}`);
    doc.font('Helvetica').text(`Breed:`, 50, currentY + 36, { continued: true }).font('Helvetica-Bold').text(` ${pet.breed || 'N/A'}`);
    doc.font('Helvetica').text(`DOB:`, 50, currentY + 54, { continued: true }).font('Helvetica-Bold').text(` ${pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A'}`);

    // Owner details
    if (pet.ownerId) {
      doc.font('Helvetica').text(`Name:`, 320, currentY, { continued: true }).font('Helvetica-Bold').text(` ${pet.ownerId.firstName} ${pet.ownerId.lastName}`);
      doc.font('Helvetica').text(`Phone:`, 320, currentY + 18, { continued: true }).font('Helvetica-Bold').text(` ${pet.ownerId.phoneNumber || 'N/A'}`);
      doc.font('Helvetica').text(`Email:`, 320, currentY + 36, { continued: true }).font('Helvetica-Bold').text(` ${pet.ownerId.email || 'N/A'}`);
    }

    // --- Medical Record / Vet Context ---
    doc.moveDown(6);
    const middleY = doc.y;
    doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('CLINICAL CONTEXT', 50, middleY);
    doc.rect(50, middleY + 20, 510, 1).fill(primaryColor);

    doc.fillColor('#333333').fontSize(11).font('Helvetica').moveDown(2.5);

    if (prescription.medicalRecordId && prescription.medicalRecordId.vetId) {
      doc.font('Helvetica-Bold').text('Attending Veterinarian:', 50, middleY + 35);
      doc.font('Helvetica').text(`Dr. ${prescription.medicalRecordId.vetId.firstName} ${prescription.medicalRecordId.vetId.lastName}`, 180, middleY + 35);
    }

    doc.font('Helvetica-Bold').text('Date Issued:', 50, middleY + 53);
    doc.font('Helvetica').text(new Date(prescription.createdAt).toLocaleDateString(), 180, middleY + 53);

    // --- Prescription DETAILS ---
    doc.moveDown(5);
    const boxY = doc.y;
    doc.rect(50, boxY, 510, 150).lineWidth(1).stroke('#cccccc');

    // Aesthetic "Rx" or "Vaccine" Badge
    doc.rect(50, boxY, 120, 30).fill(primaryColor);
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text(isVaccination ? 'VACCINATION' : 'PRESCRIPTION (Rx)', 60, boxY + 10);

    doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold').text(prescription.medicationName, 70, boxY + 50);

    doc.fontSize(12).font('Helvetica').text(`Dosage: `, 70, boxY + 75, { continued: true }).font('Helvetica-Bold').text(prescription.dosage);

    if (prescription.duration) {
      doc.fontSize(12).font('Helvetica').text(`Duration: `, 70, boxY + 95, { continued: true }).font('Helvetica-Bold').text(prescription.duration);
    }

    if (prescription.dueDate) {
      const dateLabel = isVaccination ? 'Next Booster Due:' : 'Valid Until:';
      doc.fontSize(12).font('Helvetica').text(`${dateLabel} `, 70, boxY + 115, { continued: true }).font('Helvetica-Bold').fillColor('#d32f2f').text(new Date(prescription.dueDate).toLocaleDateString());
    }

    // --- Instructions ---
    doc.fillColor('#000000').moveDown(6);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('DIRECTIONS / NOTES', 50);
    doc.rect(50, doc.y + 2, 510, 1).fill(primaryColor);
    doc.moveDown(1.5);

    doc.fillColor('#333333').fontSize(11).font('Helvetica').text(
      prescription.instructions || 'Follow as directed by your veterinarian.',
      { align: 'justify', width: 510 }
    );

    // --- Footer ---
    const footerY = 750;
    doc.rect(50, footerY - 10, 510, 1).fill('#eeeeee');
    doc.fillColor('#999999').fontSize(9).font('Helvetica')
      .text('This document is generated by PetCare-2025. It is an official medical record.', 50, footerY, { align: 'center' })
      .text(`Record ID: ${prescription._id} | Page 1 of 1`, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF' });
    }
  }
};