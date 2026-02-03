// src/pages/owner/EditPet.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    color: '',
    weight: '',
    microchipNumber: '',
    photo: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${id}`);
        const petData = response.data;

        setPet(petData);
        setFormData({
          name: petData.name || '',
          species: petData.species || '',
          breed: petData.breed || '',
          dateOfBirth: petData.dateOfBirth ? petData.dateOfBirth.split('T')[0] : '',
          gender: petData.gender || '',
          color: petData.color || '',
          weight: petData.weight || '',
          microchipNumber: petData.microchipNumber || '',
          photo: petData.photo || '',
          notes: petData.notes || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pet:', error);
        Swal.fire('Error', 'Could not load pet details', 'error');
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.species.trim()) {
      Swal.fire('Error', 'Pet name and species are required', 'warning');
      return;
    }

    setSaving(true);

    try {
      await api.put(`/pets/${id}`, formData);

      Swal.fire({
        title: 'Updated!',
        text: `${formData.name}'s profile has been updated`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      navigate(`/owner/profile`);
    } catch (error) {
      console.error('Error updating pet:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not update pet profile',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        Loading pet details...
      </div>
    );
  }

  return (
    <div className="edit-pet-page">
      <div className="form-wrapper">
        <div className="form-card">
          {/* Header */}
          <div className="card-header">
            <PetsIcon className="header-icon" />
            <h1 className="header-title">Edit Pet Profile</h1>
            <p className="header-subtitle">Update {pet?.name}'s information</p>
          </div>

          {/* Body */}
          <div className="card-body">
            <button 
              className="back-button"
              onClick={() => navigate(`/owner/profile`)}
            >
              <ArrowBackIcon /> Back to Dashboard
            </button>

            <form onSubmit={handleSubmit} className="pet-form">
              <div className="form-columns">
                {/* LEFT COLUMN */}
                <div className="form-column left">
                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Pet Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PetsIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Species *"
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Breed (Optional)"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-group">
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                      >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="Male">
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <MaleIcon sx={{ mr: 1, color: '#3B82F6' }} />
                            Male
                          </div>
                        </MenuItem>
                        <MenuItem value="Female">
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FemaleIcon sx={{ mr: 1, color: '#EC4899' }} />
                            Female
                          </div>
                        </MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="form-column right">
                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      name="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScaleIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Color/Markings"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ColorLensIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Microchip Number"
                      name="microchipNumber"
                      value={formData.microchipNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Photo URL"
                      name="photo"
                      value={formData.photo}
                      onChange={handleChange}
                      placeholder="Paste updated image link"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhotoCameraIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="field-group">
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      multiline
                      rows={5}
                      placeholder="Update medical history, behavior, or care instructions..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="form-actions">
                <Button
                  type="submit"
                  disabled={saving}
                  className="submit-btn"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>

                <Button
                  onClick={() => navigate(`/owner/profile`)}
                  disabled={saving}
                  className="cancel-btn"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .edit-pet-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          padding: 40px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-wrapper {
          width: 100%;
          max-width: 1100px;
        }

        .form-card {
          border-radius: 24px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          overflow: hidden;
          background: white;
        }

        .card-header {
          background: linear-gradient(90deg, #2196f3, #21cbf3);
          color: white;
          padding: 48px 32px;
          text-align: center;
        }

        .header-icon {
          font-size: 90px;
          margin-bottom: 20px;
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .header-subtitle {
          font-size: 1.25rem;
          opacity: 0.95;
        }

        .card-body {
          padding: 48px 40px;
        }

        @media (max-width: 900px) {
          .card-body {
            padding: 32px 24px;
          }
        }

        .back-button {
          background: none;
          border: none;
          color: #2196f3;
          font-weight: 600;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          cursor: pointer;
        }

        .back-button:hover {
          text-decoration: underline;
        }

        .pet-form {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .form-columns {
          display: flex;
          gap: 40px;
        }

        @media (max-width: 900px) {
          .form-columns {
            flex-direction: column;
            gap: 32px;
          }
        }

        .form-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field-group {
          width: 100%;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 48px;
        }

        .submit-btn {
          background: linear-gradient(90deg, #2196f3, #21cbf3) !important;
          color: white !important;
          padding: 14px 48px !important;
          border-radius: 50px !important;
          font-weight: bold !important;
          font-size: 1.2rem !important;
          text-transform: none !important;
          box-shadow: 0 8px 25px rgba(33, 150, 243, 0.3) !important;
          min-width: 280px !important;
          transition: all 0.3s !important;
        }

        .submit-btn:hover {
          background: linear-gradient(90deg, #1976d2, #00bcd4) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 35px rgba(33, 150, 243, 0.4) !important;
        }

        .cancel-btn {
          padding: 14px 48px !important;
          border-radius: 50px !important;
          font-weight: bold !important;
          font-size: 1.2rem !important;
          text-transform: none !important;
          border: 2px solid #2196f3 !important;
          color: #2196f3 !important;
          min-width: 280px !important;
          background: transparent !important;
          transition: all 0.3s !important;
        }

        .cancel-btn:hover {
          background: rgba(33, 150, 243, 0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default EditPet;