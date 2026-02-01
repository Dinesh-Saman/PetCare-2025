import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CoreFeatures = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  const features = [
    {
      image: "https://images.pexels.com/photos/5998177/pexels-photo-5998177.jpeg", // Family with happy dog at home
      title: "Pet Profile Management",
      description: "Create and manage detailed profiles for your pets including breed, age, medical history, vaccinations, and more.",
      color: "#10b981" // emerald green – caring & healthy
    },
    {
      image: "https://brookvillevet.net/wp-content/uploads/2024/08/request-an-appointment-iStock-1413492609.webp", // Owner with pet booking vibe
      title: "Easy Appointment Booking",
      description: "Find nearby clinics, book, reschedule or cancel vet appointments with real-time availability and reminders.",
      color: "#3b82f6" // blue – trust & reliability
    },
    {
      image: "https://pilina.vet/wp-content/uploads/2024/09/PV-Home-Hero.webp", // Owner & dog at beach – warm connection
      title: "Vet Chat & Consult",
      description: "Secure in-app chat with your registered veterinarian for advice, follow-ups, and questions about your pet.",
      color: "#8b5cf6" // purple – communication & care
    },
    {
      image: "https://images.pexels.com/photos/4929241/pexels-photo-4929241.jpeg", // Cat with laptop – AI/tech feel
      title: "AI Pet Health Assistant",
      description: "Get instant, reliable guidance on nutrition, vaccinations, symptoms, and preventive care from our Sri Lanka-adapted AI chatbot.",
      color: "#f59e0b" // amber – helpful & friendly
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...new Set([...prev, index])]);
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardClick = (index) => {
    if (index === 0) {
      navigate("/add-pet");       // or "/pet-profiles"
    } else if (index === 1) {
      navigate("/appointments");  // or "/book-appointment"
    } else if (index === 2) {
      navigate("/messages");      // or "/vet-chat"
    }
    // index === 3 (AI Assistant) remains non-clickable or can link to chatbot page
  };

  return (
    <>
      <style>{`
        .services-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
        }

        .services-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .services-section::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(50px, 50px) scale(1.1); }
        }

        .services-section h2 {
          text-align: center;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #1e293b, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          z-index: 1;
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 4rem;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .service-card {
          background: white;
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px);
        }

        .service-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--card-color), transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .service-card:hover::before {
          transform: scaleX(1);
        }

        .service-card.clickable {
          cursor: pointer;
        }

        .service-card.clickable:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
        }

        .service-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .icon-wrapper {
          width: 100%;
          height: 200px;
          margin: 0 0 1.5rem 0;
          border-radius: 15px;
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .icon-wrapper::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.25) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .service-card:hover .icon-wrapper::after {
          opacity: 1;
        }

        .icon-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .service-card:hover .icon-wrapper {
          transform: scale(1.03);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .service-card:hover .icon-wrapper img {
          transform: scale(1.08);
        }

        .service-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          padding: 0 1.5rem;
          color: #1e293b;
          text-align: center;
          transition: color 0.3s ease;
        }

        .service-card:hover h3 {
          color: var(--card-color);
        }

        .service-card p {
          font-size: 1rem;
          line-height: 1.7;
          padding: 0 1.5rem 2rem;
          color: #64748b;
          text-align: center;
        }

        .feature-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--card-color);
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
        }

        .service-card:hover .feature-badge {
          opacity: 1;
          transform: scale(1);
        }

        @media (max-width: 1024px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .services-section {
            padding: 3rem 1rem;
          }
          .services-section h2 {
            font-size: 2rem;
          }
          .section-subtitle {
            font-size: 1rem;
            margin-bottom: 2.5rem;
          }
          .services-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>

      <section className="services-section" ref={sectionRef}>
        <h2>Core Features of PetCare Connect</h2>
        <p className="section-subtitle">
          Everything you need to keep your pets healthy, happy, and connected to the best veterinary care in Sri Lanka
        </p>
        <div className="services-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`service-card ${visibleCards.includes(index) ? 'visible' : ''} ${
                index < 3 ? 'clickable' : ''
              }`}
              style={{
                '--card-color': feature.color,
              }}
              onClick={() => handleCardClick(index)}
            >
              <span className="feature-badge">Powered by Care</span>
              <div className="icon-wrapper">
                <img src={feature.image} alt={feature.title} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default CoreFeatures;