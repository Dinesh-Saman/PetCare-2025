import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Button, TextField, MenuItem,
  IconButton, CircularProgress, alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Pets as PetsIcon,
  Category as SpeciesIcon,
  Fingerprint as BreedIcon,
  Transgender as GenderIcon,
  Cake as CakeIcon,
  MonitorWeight as WeightIcon,
  ColorLens as ColorIcon,
  LocalHospital as ClinicIcon,
  CloudUpload as UploadIcon,
  Description as NotesIcon,
  Vaccines as VaccineIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GlassModal = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(16px)',
  borderRadius: '32px',
  boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
  width: '100%',
  maxWidth: '850px',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.5)',
}));

const AddPetModal = ({ open, onClose, onPetAdded }) => {
  if (!open) return null;

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    color: '',
    weight: '',
    photo: '',
    notes: '',
    clinicId: '',
    lastVaccinationDate: '',
    medicalRecords: ''
  });

  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await api.get('/clinics');
        setClinics(response.data.clinics || response.data || []);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        Swal.fire('Warning', 'Could not load clinics list. You can still proceed.', 'warning');
        setClinics([]);
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.species.trim() || !formData.clinicId) {
      Swal.fire('Error', 'Pet name, species, and registered clinic are required', 'warning');
      return;
    }

    setLoading(true);

    try {
      await api.post('/pets', formData);

      Swal.fire({
        title: 'Pet Added!',
        text: `${formData.name} has been successfully registered!`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });

      if (onPetAdded) onPetAdded(formData);
      onClose();
    } catch (error) {
      console.error('Error adding pet:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not add pet. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-pet-modal-overlay" onClick={onClose}>
      <GlassModal onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <PetsIcon sx={{ fontSize: 60, mb: 2, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }} />
          <Typography variant="h3" fontWeight="800" gutterBottom>
            Register New Pawpal
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            Start managing your pet's healthcare journey today
          </Typography>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field-group">
                <label><PetsIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Pet Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Buddy"
                />
              </div>

              <div className="field-group">
                <label><SpeciesIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Species *</label>
                <input
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  placeholder="Dog, Cat, Rabbit..."
                />
              </div>

              <div className="field-group">
                <label><BreedIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Breed</label>
                <input
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="Golden Retriever..."
                />
              </div>

              <div className="field-group">
                <label><GenderIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="field-group">
                <label><CakeIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label><WeightIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Weight (kg)</label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0.0"
                />
              </div>

              <div className="field-group">
                <label><ColorIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Color / Markings</label>
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Black & White..."
                />
              </div>

              <div className="field-group">
                <label><ClinicIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Preferred Vet Clinic *</label>
                <select
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  required
                  disabled={loadingClinics}
                >
                  <option value="">{loadingClinics ? 'Loading clinics...' : 'Select a Clinic'}</option>
                  {clinics.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label><VaccineIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Last Vaccination</label>
                <input
                  name="lastVaccinationDate"
                  type="date"
                  value={formData.lastVaccinationDate}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label><UploadIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Profile Photo</label>
                <div className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const d = new FormData();
                      d.append('file', file);
                      d.append('upload_preset', 'petcare_preset');
                      try {
                        const r = await fetch('https://api.cloudinary.com/v1_1/dtt1ytuzj/image/upload', { method: 'POST', body: d });
                        const data = await r.json();
                        setFormData({ ...formData, photo: data.secure_url });
                        Swal.fire({ title: 'Uploaded!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                      } catch { Swal.fire('Error', 'Upload failed', 'error'); }
                    }}
                  />
                  {formData.photo ? '✓ Photo Selected' : 'Choose Pet Photo'}
                </div>
              </div>

              <div className="field-group full-width">
                <label><NotesIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom' }} /> Medical Observations & Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any allergies, existing conditions, or special requirements..."
                />
              </div>

              <div className="submit-row">
                <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? 'Processing...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </GlassModal>
    </div>
  );
};

const styles = `
  .add-pet-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1400;
    padding: 24px;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-header {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 60px 48px;
    text-align: center;
    position: relative;
  }

  .modal-close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .modal-close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
  }

  .modal-body {
    padding: 48px;
    overflow-y: auto;
    flex: 1;
    background: #ffffff;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .field-group.full-width {
    grid-column: 1 / -1;
  }

  .field-group label {
    font-weight: 700;
    color: #334155;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
  }

  input, select, textarea {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.2s;
    color: #1e293b;
    background: #f8fafc;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #4f46e5;
    background: white;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }

  .custom-file-upload {
    position: relative;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 14px;
    text-align: center;
    color: #64748b;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8fafc;
    overflow: hidden;
  }

  .custom-file-upload:hover {
    border-color: #4f46e5;
    background: rgba(79, 70, 229, 0.05);
    color: #4f46e5;
  }

  .custom-file-upload input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .submit-row {
    grid-column: 1 / -1;
    margin-top: 16px;
  }

  .submit-btn {
    width: 100%;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    padding: 18px;
    border-radius: 16px;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(79, 70, 229, 0.4);
  }

  .submit-btn.loading {
    opacity: 0.8;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .modal-header { padding: 48px 24px; }
    .modal-body { padding: 32px 24px; }
  }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);

export default AddPetModal;