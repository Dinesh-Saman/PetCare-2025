// src/pages/owner/AddPet.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

const AddPet = () => {
  const navigate = useNavigate();

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
    notes: '',
    clinicId: ''
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

      navigate('/owner/profile');
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
    <div className="add-pet-page">
      <div className="form-card">
        <div className="card-header">
          <span className="header-icon">🐾</span>
          <h1 className="header-title">Add New Pet</h1>
          <p className="header-subtitle">
            Register your pet to manage health records and appointments
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Row 1 */}
              <div className="field-group">
                <label htmlFor="name">Pet Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🐱</span>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter pet name"
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="species">Species *</label>
                <input
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  placeholder="Dog, Cat, Bird, Rabbit..."
                />
              </div>

              {/* Row 2 */}
              <div className="field-group">
                <label htmlFor="breed">Breed (optional)</label>
                <input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="Golden Retriever, Siamese..."
                />
              </div>

              <div className="field-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Row 3 */}
              <div className="field-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <div className="input-wrapper">
                  <span className="input-icon">📅</span>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="weight">Weight (kg)</label>
                <div className="input-wrapper">
                  <span className="input-icon">⚖️</span>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 12.5"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="field-group">
                <label htmlFor="color">Color / Markings</label>
                <div className="input-wrapper">
                  <span className="input-icon">🎨</span>
                  <input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Black & White, Ginger, Tortoiseshell..."
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="microchipNumber">Microchip Number</label>
                <input
                  id="microchipNumber"
                  name="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={handleChange}
                  placeholder="985123456789012 (optional)"
                />
              </div>

              {/* Row 5 – Registered Clinic */}
              <div className="field-group full-width">
                <label htmlFor="clinicId">Registered Clinic *</label>
                <select
                  id="clinicId"
                  name="clinicId"
                  value={formData.clinicId}
                  onChange={handleChange}
                  required
                  disabled={loadingClinics}
                >
                  <option value="">
                    {loadingClinics ? 'Loading clinics...' : 'Select a clinic'}
                  </option>
                  {clinics.map((clinic) => (
                    <option key={clinic._id} value={clinic._id}>
                      {clinic.name} — {clinic.address || 'No address'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 6 – Photo */}
              <div className="field-group full-width">
                <label htmlFor="photo">Photo URL (optional)</label>
                <div className="input-wrapper">
                  <span className="input-icon">📷</span>
                  <input
                    id="photo"
                    name="photo"
                    value={formData.photo}
                    onChange={handleChange}
                    placeholder="https://example.com/pet.jpg"
                  />
                </div>
              </div>

              {/* Row 7 – Notes */}
              <div className="field-group full-width">
                <label htmlFor="notes">Additional Notes</label>
                <div className="input-wrapper notes-wrapper">
                  <span className="input-icon top">📝</span>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Medical history, allergies, favorite treats, behavior notes..."
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="submit-row">
                <button
                  type="submit"
                  className={`submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Adding Pet...' : 'Add My Pet'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .add-pet-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .form-card {
          width: 100%;
          max-width: 820px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
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
          font-size: 80px;
          display: block;
          margin-bottom: 16px;
        }

        .header-title {
          font-size: 2.4rem;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .header-subtitle {
          font-size: 1.15rem;
          opacity: 0.92;
          margin: 0;
        }

        .card-body {
          padding: 48px 40px;
        }

        @media (max-width: 768px) {
          .card-body { padding: 32px 24px; }
          .header-title { font-size: 2rem; }
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-group.full-width {
          grid-column: 1 / -1;
        }

        .field-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.3rem;
          pointer-events: none;
        }

        .input-icon.top {
          top: 14px;
          transform: none;
        }

        input, select, textarea {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
        }

        textarea {
          resize: vertical;
          min-height: 120px;
          padding-top: 12px;
          padding-left: 48px;
        }

        .notes-wrapper textarea {
          padding-top: 40px;
        }

        select {
          padding-left: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 12px;
          appearance: none;
        }

        .submit-row {
          grid-column: 1 / -1;
          text-align: center;
          margin-top: 32px;
        }

        .submit-btn {
          background: linear-gradient(90deg, #2196f3, #21cbf3);
          color: white;
          border: none;
          padding: 16px 60px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 240px;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #1976d2, #00bcd4);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(33,150,243,0.3);
        }

        .submit-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AddPet;