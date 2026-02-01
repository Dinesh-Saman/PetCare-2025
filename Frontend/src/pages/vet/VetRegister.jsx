import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import vetImage from '../../images/vet1.png';

const AuthContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 1200px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  background: white;

  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 600px;
  }

  @media (max-width: 600px) {
    max-width: 100%;
    margin: 0 10px;
    border-radius: 20px;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  min-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  color: white;
  padding: 50px;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(${vetImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 1;
    z-index: 0;
  }

  & > div {
    position: relative;
    z-index: 1;
    max-width: 360px;
    margin-bottom: 40px;
  }

  @media (max-width: 900px) {
    min-width: unset;
    height: 320px;
    padding: 40px;
  }
`;

const RightSection = styled.div`
  flex: 1.2;
  padding: 60px 80px;
  background-color: white;
  display: flex;
  flex-direction: column;

  @media (max-width: 900px) {
    padding: 50px 40px;
  }

  @media (max-width: 600px) {
    padding: 40px 30px;
  }
`;

const Title = styled.h1`
  font-size: 2.6rem;
  font-weight: bold;
  color: #8e24aa;
  text-align: center;
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.2rem;
`;

const Form = styled.form`
  width: 100%;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 18px 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: border 0.3s ease;

  &:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

// Styled Select for Specialization Dropdown
const SelectWrapper = styled.div`
  position: relative;
  margin-bottom: 32px;
`;

const Select = styled.select`
  width: 100%;
  padding: 18px 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1.1rem;
  background-color: white;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: border 0.3s ease;

  &:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.1);
  }

  /* Custom arrow */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 20px center;
  background-repeat: no-repeat;
  background-size: 12px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
  font-size: 1.1rem;
  color: #444;
`;

const Checkbox = styled.input`
  margin-right: 14px;
  transform: scale(1.4);
  accent-color: #8e24aa;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(90deg, #8e24aa, #ab47bc);
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #7b1fa2, #9c27b0);
    transform: translateY(-3px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 40px;
  font-size: 1.15rem;
  color: #666;
`;

const LinkText = styled.a`
  color: #8e24aa;
  font-weight: bold;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// List of common veterinary specializations
const specializations = [
  'General Practice',
  'Surgery',
  'Dermatology',
  'Internal Medicine',
  'Cardiology',
  'Oncology',
  'Neurology',
  'Ophthalmology',
  'Dentistry',
  'Emergency & Critical Care',
  'Radiology',
  'Anesthesiology',
  'Behavior',
  'Exotic Animals',
  'Avian Medicine',
  'Equine Medicine',
  'Wildlife Medicine'
];

const VetRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    clinicId: '',
    isPrimaryVet: false
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.veterinaryId) {
      Swal.fire('Error', 'Please fill all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.post('/vets/register', formData);

      Swal.fire({
        title: 'Registration Successful!',
        text: 'Welcome to PawPal Veterinary System',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = loginRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/vet/login');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <LeftSection>
          <div>
            <h1 style={{ fontSize: '3.4rem', marginBottom: '16px' }}>PawPal</h1>
            <h2 style={{ opacity: 0.95, marginBottom: '24px', fontSize: '2rem' }}>
              Veterinary Management System
            </h2>
            <p style={{ maxWidth: '340px', margin: '0 auto', fontSize: '1.2rem' }}>
              Caring for pets, empowering veterinarians.
            </p>
          </div>
        </LeftSection>

        <RightSection>
          <Title>Join as Veterinarian</Title>
          <Subtitle>Create your professional account</Subtitle>

          <Form onSubmit={handleSubmit}>
            <InputGrid>
              <Input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </InputGrid>

            <Input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ marginBottom: '24px' }}
            />

            <Input
              type="password"
              name="password"
              placeholder="Password *"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ marginBottom: '24px' }}
            />

            <InputGrid>
              <Input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="veterinaryId"
                placeholder="Veterinary License ID *"
                value={formData.veterinaryId}
                onChange={handleChange}
                required
              />
            </InputGrid>

            {/* Specialization Dropdown */}
            <SelectWrapper>
              <Select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                style={{color:'gray'}}
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </Select>
            </SelectWrapper>

            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="isPrimaryVet"
                checked={formData.isPrimaryVet}
                onChange={handleChange}
              />
              <span>I am the Primary Veterinarian of my clinic</span>
            </CheckboxContainer>

            {formData.isPrimaryVet && (
              <Input
                type="text"
                name="clinicId"
                placeholder="Clinic ID (if already created) - Leave blank for new clinic"
                value={formData.clinicId}
                onChange={handleChange}
                style={{ marginBottom: '32px' }}
              />
            )}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register as Veterinarian'}
            </SubmitButton>
          </Form>

          <LoginLink>
            Already have an account?{' '}
            <LinkText href="/vet/login">Sign In</LinkText>
          </LoginLink>
        </RightSection>
      </AuthCard>
    </AuthContainer>
  );
};

export default VetRegister;