// src/components/VetBanner.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VetBanner = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const handleAction = () => {
    if (user && (user.role === 'vet' || user.role === 'clinic_staff')) {
      navigate('/vet/dashboard');
    } else {
      openAuthModal('login', 'vet');
    }
  };

  return (
    <>
      <style>{`
        .vet-banner {
          margin: 4rem 2rem;
          background: linear-gradient(135deg, #49149e 0%, #310d6b 100%);
          border-radius: 30px;
          padding: 5rem 3rem;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(73, 20, 158, 0.3);
        }
        .vet-banner h2 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
        }
        .vet-banner p {
          font-size: 1.25rem;
          max-width: 800px;
          margin: 0 auto 3rem;
          opacity: 0.9;
          position: relative;
          z-index: 2;
        }
        .banner-btn {
          padding: 1.25rem 3.5rem;
          background: #ffd700;
          color: #49149e;
          font-size: 1.3rem;
          font-weight: 800;
          border-radius: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .banner-btn:hover {
          transform: scale(1.05);
          background: #ffea00;
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
        .pattern-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: radial-gradient(#fff 1px, transparent 1px);
          background-size: 30px 30px;
        }
        @media (max-width: 768px) {
          .vet-banner { padding: 3rem 1.5rem; margin: 2rem 1rem; }
          .vet-banner h2 { font-size: 2rem; }
          .vet-banner p { font-size: 1rem; }
          .banner-btn { width: 100%; padding: 1rem; }
        }
      `}</style>

      <section className="vet-banner">
        <div className="pattern-overlay" />
        <h2>Scale Your Veterinary Practice</h2>
        <p>
          Join hundreds of veterinarians in Sri Lanka providing better care through digital innovation. Efficiently manage your clinic and reach more pet owners.
        </p>
        <button onClick={handleAction} className="banner-btn">
          Access Vet Dashboard
        </button>
      </section>
    </>
  );
};

export default VetBanner;
