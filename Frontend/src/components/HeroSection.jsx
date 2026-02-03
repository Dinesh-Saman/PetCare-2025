import React, { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // High-quality, relevant images for pet care / veterinary theme
  const slides = [
    "https://images.pexels.com/photos/10361804/pexels-photo-10361804.jpeg",     // Happy dog & owner
    "https://images.pexels.com/photos/32830896/pexels-photo-32830896.jpeg",     // Vet with cat
    "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",     // Cute pets
    "https://images.pexels.com/photos/3860304/pexels-photo-3860304.jpeg",       // Dog at vet / happy moment
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=900&fit=crop",     // Family with dog & cat
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleGetStarted = () => {
    // Can link to registration, dashboard, or pet profile creation
    window.location.href = "/register"; // or "/dashboard" / "/add-pet"
  };

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          height: 550px;
          overflow: hidden;
          margin-top: 96px;
        }
        .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 1.2s ease-in-out;
        }
        .hero-slide.active {
          opacity: 1;
        }
        .hero-slide.inactive {
          opacity: 0;
        }
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.65), rgba(0, 80, 120, 0.45), transparent);
          z-index: 1;
        }
        .hero-content-wrapper {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1.5rem;
        }
        .hero-content {
          max-width: 52rem;
          color: white;
          text-align: center;
          animation: fadeIn 1.2s ease-out;
        }
        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.15;
          animation: slideUp 0.9s ease-out;
        }
        .hero-content p {
          font-size: 1.35rem;
          margin-bottom: 2.5rem;
          opacity: 0.92;
          animation: slideUp 0.9s ease-out 0.25s backwards;
        }
        .hero-button {
          display: inline-block;
          padding: 1.1rem 2.5rem;
          background: linear-gradient(to right, #10b981, #3b82f6);
          color: white;
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: 700;
          border-radius: 9999px;
          border: none;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: scale(1);
          transition: all 0.35s ease;
          animation: slideUp 0.9s ease-out 0.5s backwards;
          cursor: pointer;
        }
        .hero-button:hover {
          transform: scale(1.08);
          box-shadow: 0 0 45px rgba(16, 185, 129, 0.5);
        }
        .slide-indicators {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          z-index: 20;
        }
        .slide-indicator {
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.55);
          border: none;
          cursor: pointer;
          transition: all 0.35s ease;
        }
        .slide-indicator.active {
          background-color: white;
          width: 2.2rem;
        }
        .slide-indicator:hover {
          background-color: rgba(255, 255, 255, 0.85);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
          .hero-content p {
            font-size: 1.15rem;
          }
          .hero-section {
            height: 480px;
          }
        }
      `}</style>

      <header className="hero-section">
        {/* Slideshow Images */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? "active" : "inactive"}`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}

        {/* Gradient Overlay */}
        <div className="hero-overlay" />

        {/* Main Content */}
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h1>PetCare Connect</h1>
            <p>
              Your all-in-one platform for pet health management in Sri Lanka. register pets, book vet appointments, 
              chat with veterinarians, track vaccinations & medications, and get instant AI-powered pet care advice.
            </p>
            <button onClick={handleGetStarted} className="hero-button">
              Get Started — Add Your Pet Today
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`slide-indicator ${index === currentSlide ? "active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </header>
    </>
  );
};

export default HeroSection;