import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, TextField, Box, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';

const AddPetModal = ({ open, onClose, onPetAdded }) => {
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

  const handleSubmit = async () => {
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ p: 4, pb: 1 }}>
        <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>Add New Pet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>Fill in your pet's details to start managing their healthcare journey.</Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4, pt: 5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <TextField fullWidth label="Pet Name *" name="name" value={formData.name} onChange={handleChange} />

          <TextField fullWidth label="Species *" name="species" value={formData.species} onChange={handleChange} placeholder="Dog, Cat..." />

          <TextField fullWidth label="Breed" name="breed" value={formData.breed} onChange={handleChange} />

          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.dateOfBirth}
            onChange={handleChange}
            inputProps={{
              max: new Date().toISOString().split('T')[0]
            }}
          />

          <TextField fullWidth label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />

          <TextField fullWidth label="Color/Markings" name="color" value={formData.color} onChange={handleChange} />

          <FormControl fullWidth>
            <InputLabel>Vet Clinic *</InputLabel>
            <Select label="Vet Clinic *" name="clinicId" value={formData.clinicId} onChange={handleChange} disabled={loadingClinics}>
              <MenuItem value="">{loadingClinics ? 'Loading...' : 'Select Clinic'}</MenuItem>
              {clinics.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Last Vaccination"
            name="lastVaccinationDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.lastVaccinationDate}
            onChange={handleChange}
            inputProps={{
              max: new Date().toISOString().split('T')[0]
            }}
          />

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              borderRadius: '8px',
              py: 1.5,
              borderStyle: 'dashed',
              borderColor: '#4f46e5',
              color: '#4f46e5',
              height: '100%'
            }}
          >
            {formData.photo ? '✓ Profile Photo Selected' : 'Upload Profile Photo'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const d = new FormData();
                d.append('file', file);
                d.append('upload_preset', 'petcare_preset');
                try {
                  console.log('Uploading photo to Cloudinary...');
                  const r = await fetch('https://api.cloudinary.com/v1_1/dy78lcfqg/auto/upload', { method: 'POST', body: d });
                  const data = await r.json();
                  console.log('Photo upload result:', data);
                  setFormData({ ...formData, photo: data.secure_url });
                  Swal.fire({ title: 'Uploaded!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                } catch { Swal.fire('Error', 'Upload failed', 'error'); }
              }}
            />
          </Button>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField fullWidth label="Additional Notes" name="notes" multiline rows={3} value={formData.notes} onChange={handleChange} placeholder="Allergies, conditions, etc..." />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700, color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            borderRadius: '12px',
            fontWeight: 700,
            px: 4,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
            }
          }}
        >
          {loading ? 'Processing...' : 'Add Pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPetModal;