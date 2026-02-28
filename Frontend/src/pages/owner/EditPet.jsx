// src/pages/owner/EditPet.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';

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
        timer: 3000,
        showConfirmButton: false
      });
      navigate('/owner/profile');
    } catch (error) {
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
      <div className="edit-pet-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pet details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-pet-page">
      <div className="form-wrapper">
        <div className="form-card">
          {/* Header */}
          <div className="card-header">
            <span className="header-icon">🐾</span>
            <h1 className="header-title">Edit Pet Profile</h1>
            <p className="header-subtitle">Update {pet?.name}'s information</p>
          </div>

          {/* Body */}
          <div className="card-body">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/owner/profile')}
            >
              ← Back to Dashboard
            </button>

            <form onSubmit={handleSubmit} className="pet-form">
              <div className="form-columns">
                {/* LEFT COLUMN */}
                <div className="form-column">
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
                      placeholder="Dog, Cat, Rabbit, etc."
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="breed">Breed (Optional)</label>
                    <input
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      placeholder="Golden Retriever, Siamese, etc."
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
                </div>

                {/* RIGHT COLUMN */}
                <div className="form-column">
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
                      placeholder="985123456789012"
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="photo">Photo URL</label>
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

                  <div className="field-group">
                    <label htmlFor="notes">Notes</label>
                    <div className="input-wrapper notes-wrapper">
                      <span className="input-icon top">📝</span>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Update medical history, behavior, or care instructions..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={saving}
                  className={`submit-btn ${saving ? 'saving' : ''}`}
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/owner/profile')}
                  disabled={saving}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .edit-pet-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          padding: 40px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          font-size: 80px;
          display: block;
          margin-bottom: 16px;
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .header-subtitle {
          font-size: 1.25rem;
          opacity: 0.95;
          margin: 0;
        }

        .card-body {
          padding: 48px 40px;
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
          transition: color 0.2s;
        }

        .back-button:hover {
          color: #1976d2;
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

        .form-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          left: 14px;
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
        }

        .form-actions {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 48px;
        }

        .submit-btn, .cancel-btn {
          padding: 14px 48px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.15rem;
          min-width: 260px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .submit-btn {
          background: linear-gradient(90deg, #2196f3, #21cbf3);
          color: white;
          border: none;
          box-shadow: 0 8px 25px rgba(33, 150, 243, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(33, 150, 243, 0.4);
        }

        .submit-btn.saving {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: transparent;
          border: 2px solid #2196f3;
          color: #2196f3;
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(33, 150, 243, 0.08);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #555;
          font-size: 1.2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .form-columns { flex-direction: column; gap: 32px; }
          .card-body { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
};

export default EditPet;