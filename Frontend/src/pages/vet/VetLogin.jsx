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
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
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
    console.log('=== VET LOGIN ATTEMPT ===');
    console.log('Email:', formData.email);
    
    // Clear ALL old tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('owner');
    localStorage.removeItem('vet');
    sessionStorage.clear();
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];

    console.log('Calling /auth/login with:', {
      email: formData.email,
      password: '***',
      userType: 'vet'
    });

    const response = await api.post('/auth/login', {
      email: formData.email,
      password: formData.password,
      userType: 'vet'
    });

    console.log('Login response:', response.data);
    
    const { token, user } = response.data;

    // VALIDATE: Must be a veterinarian
    if (!user) {
      setError('No user data received from server');
      setLoading(false);
      return;
    }

    console.log('User data:', user);
    console.log('User role:', user.role);

    if (user.role !== 'vet') {
      setError(`This portal is for veterinarians only. You are: ${user.role || 'unknown'}. Please use pet owner login.`);
      
      // Clear any partial data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setLoading(false);
      return;
    }

    // Decode and verify token
    console.log('=== TOKEN ANALYSIS ===');
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Full token payload:', payload);
        console.log('Token id:', payload.id);
        console.log('Token role:', payload.role);
        console.log('Token userType:', payload.userType);
        console.log('All token fields:', Object.keys(payload));
        
        // TEMPORARY: Accept token even without role field for debugging
        if (!payload.role) {
          console.warn('Token does not have role field. This might be an old token format.');
          console.log('Accepting token anyway for debugging...');
        } else if (payload.role !== 'vet') {
          console.warn(`Token role is ${payload.role}, expected vet`);
          setError(`Invalid authentication token (role: ${payload.role}). Please try again.`);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
      } catch (decodeErr) {
        console.error('Could not decode token:', decodeErr);
        console.error('Token string:', token.substring(0, 50) + '...');
        setError('Authentication error. Invalid token format.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
    } else {
      console.error('Invalid token format. Expected 3 parts, got:', tokenParts.length);
      setError('Invalid token format received from server.');
      setLoading(false);
      return;
    }

    // Store authentication data - SEPARATE from owner data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('vet', JSON.stringify(user));
    
    // Set default auth header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Try a simpler test endpoint first
    try {
      console.log('Testing simple auth endpoint...');
      const testRes = await api.get('/auth/me');
      console.log('Auth test successful:', testRes.data);
    } catch (verifyError) {
      console.error('Auth test failed:', verifyError);
      console.error('Error response:', verifyError.response?.data);
      
      // Try the pets test endpoint as fallback
      try {
        console.log('Trying pets test endpoint as fallback...');
        const petsTest = await api.get('/pets/test-simple');
        console.log('Pets test successful:', petsTest.data);
      } catch (petsError) {
        console.error('Pets test also failed:', petsError);
        setError('Authentication failed. Token validation error.');
        localStorage.clear();
        delete api.defaults.headers.common['Authorization'];
        setLoading(false);
        return;
      }
    }

    // Show success message
    Swal.fire({
      title: 'Welcome back, Doctor!',
      text: `Dr. ${user.firstName} ${user.lastName}`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      background: '#ffffff',
      color: '#333',
    });

    // Navigate to vet dashboard
    setTimeout(() => {
      navigate('/vet/dashboard');
    }, 1600);

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error headers:', error.response?.headers);
    console.error('Full error:', error);
    
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Invalid email or password.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    setError(errorMessage);
    
    // Clear any partial authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vet');
    delete api.defaults.headers.common['Authorization'];
    
    Swal.fire({
      title: 'Login Failed',
      text: errorMessage,
      icon: 'error',
      background: '#ffffff',
      color: '#333',
      confirmButtonColor: '#8e24aa',
    });
  } finally {
    setLoading(false);
  }
};

  // Debug function (temporary)
  const debugAuth = () => {
    console.log('=== DEBUG AUTH INFO ===');
    console.log('LocalStorage token:', localStorage.getItem('token'));
    console.log('LocalStorage user:', localStorage.getItem('user'));
    console.log('LocalStorage vet:', localStorage.getItem('vet'));
    console.log('LocalStorage owner:', localStorage.getItem('owner'));
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
      } catch (e) {
        console.error('Could not decode token:', e);
      }
    }
  };

  return (
    <AuthContainer>
      {/* Debug button (remove in production) */}
      <button 
        onClick={debugAuth}
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          padding: '4px 8px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Debug Auth
      </button>

      <AuthCard>
        <LeftSection>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>PawPal</h1>
            <h2 style={{ opacity: 0.95, marginBottom: '24px' }}>
              Veterinary Management System
            </h2>
            <p style={{ maxWidth: '300px', margin: '0 auto' }}>
              Caring for pets, empowering veterinarians.
            </p>
          </div>
        </LeftSection>

        <RightSection>
          <Title>Veterinarian Login</Title>
          <Subtitle>Access your clinic dashboard</Subtitle>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

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
              {loading ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}>
                    ⏳
                  </span>
                  Signing in...
                </>
              ) : 'Sign In'}
            </SubmitButton>
          </Form>

          <RegisterLink>
            <p style={{ color: '#666', marginBottom: '8px' }}>New to PawPal?</p>
            <LinkText href="/vet/register">
              Register as a Veterinarian
            </LinkText>
          </RegisterLink>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ color: '#666', marginBottom: '8px' }}>Are you a pet owner?</p>
            <LinkText href="/owner/login">
              Go to Pet Owner Login
            </LinkText>
          </div>

          {/* Debug section - can be removed later */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={() => {
                console.log('Current localStorage:');
                console.log('Token:', localStorage.getItem('token'));
                console.log('User:', localStorage.getItem('user'));
                console.log('Vet:', localStorage.getItem('vet'));
                console.log('Owner:', localStorage.getItem('owner'));
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ddd',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Debug Storage
            </button>
          </div>
        </RightSection>
      </AuthCard>
    </AuthContainer>
  );
};

export default VetLogin;