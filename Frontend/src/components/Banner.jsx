import React, { useState, useEffect } from "react";

const Banner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClick = () => {
    window.location.href = '/register'; // or '/add-pet' / '/dashboard' – start pet registration flow
  };

  return (
    <>
      <style>{`
        .banner-section {
          position: relative;
          margin: 4rem 2rem;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .banner-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 500px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .banner-content {
          padding: 4rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
          opacity: 0;
          transform: translateX(-30px);
          animation: slideInLeft 0.8s ease-out 0.3s forwards;
        }

        @keyframes slideInLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .banner-label {
          display: inline-block;
          padding: 0.5rem 1.2rem;
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          width: fit-content;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .banner-content h2 {
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .banner-highlight {
          background: linear-gradient(135deg, #10b981, #14b8a6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .banner-content p {
          font-size: 1.15rem;
          line-height: 1.8;
          color: #94a3b8;
          margin-bottom: 2.5rem;
        }

        .banner-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .banner-button {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .banner-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
        }

        .banner-link {
          color: #10b981;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: gap 0.3s ease;
        }

        .banner-link:hover {
          gap: 1rem;
        }

        .banner-image-wrapper {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1e293b, #334155);
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          animation: fadeIn 1s ease-out 0.5s forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        .banner-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #0f172a 0%, transparent 100%);
          z-index: 1;
        }

        .floating-elements {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent);
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -100px;
          animation: float 8s ease-in-out infinite;
        }

        .circle-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          left: 10%;
          animation: float 10s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .feature-points {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
        }

        .feature-point {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .feature-text {
          color: #cbd5e1;
          font-size: 0.95rem;
        }

        @media (max-width: 968px) {
          .banner-section {
            margin: 2rem 1rem;
          }

          .banner-grid {
            grid-template-columns: 1fr;
          }

          .banner-content {
            padding: 3rem 2rem;
          }

          .banner-content h2 {
            font-size: 2.2rem;
          }

          .banner-image-wrapper {
            min-height: 300px;
          }

          .banner-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .feature-points {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>

      <section className="banner-section">
        <div className="banner-grid">
          <div className="banner-content">
            <div className="floating-elements">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
            </div>
            
            <span className="banner-label">Pet Health Made Simple</span>
            <h2>
              Keep Your Pets <span className="banner-highlight">Healthy & Happy</span> with Pawpal
            </h2>
            <p>
              Register your pets, book vet appointments, chat with veterinarians, set vaccination & medication reminders, and get instant AI-powered advice tailored for Sri Lankan pet owners — all in one secure platform.
            </p>
            
            <div className="banner-actions">
              <button onClick={handleClick} className="banner-button">
                Get Started — Add Your Pet
              </button>
              <a href="#features" className="banner-link">
                Discover Features →
              </a>
            </div>

            <div className="feature-points">
              <div className="feature-point">
                <div className="feature-icon">✓</div>
                <span className="feature-text">Easy Vet Booking</span>
              </div>
              <div className="feature-point">
                <div className="feature-icon">✓</div>
                <span className="feature-text">Secure Vet Chat</span>
              </div>
              <div className="feature-point">
                <div className="feature-icon">✓</div>
                <span className="feature-text">AI Health Guidance</span>
              </div>
            </div>
          </div>

          <div className="banner-image-wrapper">
            <div className="banner-image-overlay"></div>
            <img 
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=600&fit=crop" 
              alt="Happy pet owner with dog and veterinarian care"
              className="banner-image"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;