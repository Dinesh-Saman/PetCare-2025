import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import vetImage from '../../images/veterinarian.jpg';

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
  max-width: 900px;
  max-height: 680px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  background: white;

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 480px;
    max-height: none;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  color: white;
  padding: 40px;
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
    max-width: 320px;
    margin-bottom: 30px;
  }

  @media (max-width: 768px) {
    height: 280px;
    padding: 30px;
  }
`;

const RightSection = styled.div`
  flex: 1;
  padding: 50px 60px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 40px;
  }
`;

const Form = styled.form`
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 24px;
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

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #8e24aa, #ab47bc);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 32px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #7b1fa2, #9c27b0);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #8e24aa;
  text-align: center;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.1rem;
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 40px;
  font-size: 1.1rem;
`;

const LinkText = styled.a`
  color: #8e24aa;
  font-weight: bold;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-left: 4px solid #c62828;
`;

const VetLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clear only vet-related items
      localStorage.removeItem('vet_token');
      localStorage.removeItem('vet_user');
      localStorage.removeItem('vet');

      delete api.defaults.headers.common['Authorization'];

      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      if (!user || user.role !== 'vet') {
        setError(`This portal is for veterinarians only. Detected role: ${user?.role || 'none'}`);
        setLoading(false);
        return;
      }

      // Optional: decode & verify role (can be removed later)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'vet') {
        setError('Token role mismatch - please try again');
        setLoading(false);
        return;
      }

      // Store prefixed
      localStorage.setItem('vet_token', token);
      localStorage.setItem('vet_user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Quick auth test
      await api.get('/auth/me');

      Swal.fire({
        title: 'Welcome back, Doctor!',
        text: `Dr. ${user.firstName} ${user.lastName}`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });

      setTimeout(() => navigate('/vet/dashboard'), 2000);
    } catch (err) {
      let msg = 'Login failed. Please check your credentials.';
      if (err.response?.status === 401) msg = 'Invalid email or password';
      if (err.response?.data?.message) msg = err.response.data.message;

      setError(msg);

      localStorage.removeItem('vet_token');
      localStorage.removeItem('vet_user');
      localStorage.removeItem('vet');
      delete api.defaults.headers.common['Authorization'];

      Swal.fire('Login Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <LeftSection>
          <div>
            <h1 style={{ fontSize: '3.2rem', marginBottom: '16px' }}>PawPal</h1>
            <h2 style={{ opacity: 0.95 }}>Veterinary Management</h2>
          </div>
        </LeftSection>

        <RightSection>
          <Title>Veterinarian Login</Title>
          <Subtitle>Access your clinic dashboard</Subtitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </SubmitButton>
          </Form>

          <RegisterLink>
            <p>New to PawPal?</p>
            <LinkText href="/vet/register">Register as Veterinarian</LinkText>
          </RegisterLink>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p>Pet owner?</p>
            <LinkText href="/owner/login">Go to Owner Login</LinkText>
          </div>
        </RightSection>
      </AuthCard>
    </AuthContainer>
  );
};

export default VetLogin;