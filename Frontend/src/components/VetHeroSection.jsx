// src/components/VetHeroSection.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const VetHeroSection = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://images.pexels.com/photos/6235011/pexels-photo-6235011.jpeg", // Vet examining dog
    "https://images.pexels.com/photos/6235228/pexels-photo-6235228.jpeg", // Modern clinic
    "https://d1yxio7e17x1c5.cloudfront.net/app/uploads/20191006105514/iStock-529121920.jpg", // Vet staff
    "https://smb.ibsrv.net/imageresizer/image/article_manager/1200x1200/23441/1261805/heroimage0.038553001735560066.jpg",
    "https://www.daysmart.com/vet/wp-content/uploads/sites/3/2025/04/shutterstock_2285054095.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleLoginClick = () => {
    if (user && (user.role === 'vet' || user.role === 'clinic_staff')) {
      navigate('/vet/dashboard');
    } else {
      openAuthModal('login', 'vet');
    }
  };

  return (
    <>
      <style>{`
        .vet-hero {
          position: relative;
          height: 600px;
          overflow: hidden;
          margin-top: 96px;
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 1.2s ease-in-out;
        }
        .hero-slide.active { opacity: 1; }
        .hero-slide.inactive { opacity: 0; }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(73, 20, 158, 0.7), rgba(142, 36, 170, 0.5), transparent);
          z-index: 1;
        }
        .hero-content-wrapper {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 10%;
        }
        .hero-content {
          max-width: 600px;
          color: white;
          animation: fadeIn 1.2s ease-out;
        }
        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }
        .hero-content p {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
        }
        .hero-button {
          display: inline-block;
          padding: 1.2rem 3rem;
          background: white;
          color: #49149e;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 800;
          border-radius: 12px;
          border: none;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .hero-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          background: #f8f9fa;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 960px) {
          .vet-hero { height: 500px; margin-top: 80px; }
          .hero-content h1 { font-size: 2.5rem; }
          .hero-content-wrapper { justify-content: center; text-align: center; }
        }
      `}</style>

      <section className="vet-hero">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? "active" : "inactive"}`}
            style={{
              backgroundImage: `url(${slide})`,
              backgroundPosition: index === 0 ? 'top' : 'center',
              transform: index === 4 ? 'scaleX(-1)' : 'none'
            }}
          />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h1>Empowering Sri Lankan <br /><span style={{ color: '#ffd700' }}>Veterinarians</span></h1>
            <p>
              Join Sri Lanka's leading digital pet care network. Manage appointments, medical records, and owner communications seamlessly in one professional platform.
            </p>
            <button onClick={handleLoginClick} className="hero-button">
              Login to Vet Portal
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default VetHeroSection;
