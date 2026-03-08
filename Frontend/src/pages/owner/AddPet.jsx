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
        <div className="modal-body">
          <div className="simple-header">
            <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b' }}>
              Register New Pawpal
            </Typography>
            <button className="modal-close-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <Typography variant="body2" sx={{ color: '#64748b', mb: 3, mt: -1 }}>
            Fill in your pet's details to start managing their healthcare journey.
          </Typography>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field-group">
                <label><PetsIcon sx={{ fontSize: 16, mr: 1 }} /> Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Buddy"
                />
              </div>

              <div className="field-group">
                <label><SpeciesIcon sx={{ fontSize: 16, mr: 1 }} /> Species *</label>
                <input
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  placeholder="Dog, Cat..."
                />
              </div>

              <div className="field-group">
                <label><BreedIcon sx={{ fontSize: 16, mr: 1 }} /> Breed</label>
                <input
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="Golden Retriever"
                />
              </div>

              <div className="field-group">
                <label><GenderIcon sx={{ fontSize: 16, mr: 1 }} /> Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="field-group">
                <label><CakeIcon sx={{ fontSize: 16, mr: 1 }} /> Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label><WeightIcon sx={{ fontSize: 16, mr: 1 }} /> Weight (kg)</label>
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
                <label><ColorIcon sx={{ fontSize: 16, mr: 1 }} /> Color/Markings</label>
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Black & White"
                />
              </div>

              <div className="field-group">
                <label><ClinicIcon sx={{ fontSize: 16, mr: 1 }} /> Vet Clinic *</label>
                <select
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  required
                  disabled={loadingClinics}
                >
                  <option value="">{loadingClinics ? 'Loading...' : 'Select Clinic'}</option>
                  {clinics.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label><VaccineIcon sx={{ fontSize: 16, mr: 1 }} /> Last Vac.</label>
                <input
                  name="lastVaccinationDate"
                  type="date"
                  value={formData.lastVaccinationDate}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label><UploadIcon sx={{ fontSize: 16, mr: 1 }} /> Profile Photo</label>
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
                  {formData.photo ? '✓ Done' : 'Choose File'}
                </div>
              </div>

              <div className="field-group full-width">
                <label><NotesIcon sx={{ fontSize: 16, mr: 1 }} /> Medical Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Allergies, conditions, etc..."
                />
              </div>

              <div className="submit-row">
                <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? 'Processing...' : 'Register Pawpal'}
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
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1400;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .simple-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .modal-close-btn {
    background: #f1f5f9;
    border: none;
    color: #64748b;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .modal-close-btn:hover {
    background: #e2e8f0;
    color: #1e293b;
    transform: scale(1.1);
  }

  .modal-body {
    padding: 32px;
    background: #ffffff;
    overflow-y: auto;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 24px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-group.full-width {
    grid-column: 1 / -1;
  }

  .field-group label {
    font-weight: 600;
    color: #334155;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
    color: #1e293b;
    background: #f8fafc;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #2563eb;
    background: white;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .custom-file-upload {
    position: relative;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    background: #f8fafc;
    overflow: hidden;
  }

  .custom-file-upload:hover {
    border-color: #2563eb;
    background: rgba(37, 99, 235, 0.05);
  }

  .custom-file-upload input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .submit-row {
    grid-column: 1 / -1;
    margin-top: 20px;
  }

  .submit-btn {
    width: 100%;
    background: #1e293b;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn:hover {
    background: #0f172a;
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }

  .submit-btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
    .modal-body { padding: 24px; }
  }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);

export default AddPetModal;