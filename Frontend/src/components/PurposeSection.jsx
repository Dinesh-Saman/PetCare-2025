import React from "react";
import { Heart, Globe, Bot, ShieldCheck } from "lucide-react";

const PurposeSection = () => {
  const points = [
    {
      icon: <Heart size={32} />,
      title: "Compassionate Care",
      description: "Empowering pet owners with digital tools to track health, vaccinations, and daily wellness with ease.",
      color: "#ef4444"
    },
    {
      icon: <Globe size={32} />,
      title: "Connecting Communities",
      description: "Bridging the gap between pet owners and Sri Lanka's best veterinary clinics through seamless digital communication.",
      color: "#3b82f6"
    },
    {
      icon: <Bot size={32} />,
      title: "AI-Powered Guidance",
      description: "Instant, reliable pet care support powered by AI, tailored specifically for the unique environment of Sri Lanka.",
      color: "#10b981"
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Trusted Security",
      description: "Your pet's medical data is secured with enterprise-grade protection, ensuring privacy and peace of mind.",
      color: "#8b5cf6"
    }
  ];

  return (
    <>
      <style>{`
        .purpose-section {
          padding: 80px 20px;
          background: #ffffff;
          position: relative;
        }

        .purpose-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .purpose-header {
          margin-bottom: 60px;
        }

        .purpose-header h2 {
          font-size: 3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .purpose-header p {
          font-size: 1.25rem;
          color: #64748b;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .purpose-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .purpose-card {
          padding: 40px;
          background: #f8fafc;
          border-radius: 24px;
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
        }

        .purpose-card:hover {
          transform: translateY(-8px);
          background: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          border-color: #e2e8f0;
        }

        .purpose-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 24px;
        }

        .purpose-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .purpose-card p {
          color: #475569;
          line-height: 1.6;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .purpose-header h2 { font-size: 2.25rem; }
          .purpose-header p { font-size: 1.1rem; }
        }
      `}</style>

      <section className="purpose-section">
        <div className="purpose-wrapper">
          <div className="purpose-header">
            <h2>Our Purpose</h2>
            <p>
              At PawPal, we are dedicated to revolutionizing pet healthcare in Sri Lanka by combining
              compassion with cutting-edge technology.
            </p>
          </div>

          <div className="purpose-grid">
            {points.map((point, index) => (
              <div key={index} className="purpose-card">
                <div
                  className="purpose-icon-box"
                  style={{ background: point.color }}
                >
                  {point.icon}
                </div>
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default PurposeSection;
