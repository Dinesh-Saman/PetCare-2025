import React from "react";
import { UserPlus, Calendar, MessageSquare, ShieldCheck } from "lucide-react";

const HowItWorks = () => {
    const steps = [
        {
            icon: <UserPlus size={32} />,
            title: "1. Register Your Pet",
            description: "Create a digital profile for your pet with medical history, species, and breed details to get personalized care.",
            color: "#3b82f6"
        },
        {
            icon: <Calendar size={32} />,
            title: "2. Book Appointments",
            description: "Browse registered clinics in Sri Lanka and book appointments with real-time availability in just few clicks.",
            color: "#10b981"
        },
        {
            icon: <MessageSquare size={32} />,
            title: "3. Direct Vet Chat",
            description: "Start a private conversation with your veterinarian. Ask questions and share medical records securely.",
            color: "#8b5cf6"
        },
        {
            icon: <ShieldCheck size={32} />,
            title: "4. AI Health Support",
            description: "Our AI-powered assistant provides instant first-aid advice and pet care tips tailored for the Sri Lankan context.",
            color: "#f59e0b"
        }
    ];

    return (
        <>
            <style>{`
        .how-it-works-section {
          padding: 60px 20px;
          background-color: #f8fafc;
          position: relative;
          overflow: hidden;
        }

        .how-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .how-header {
          text-align: center;
          margin-bottom: 70px;
        }

        .how-header h2 {
          font-size: 3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .how-header p {
          font-size: 1.25rem;
          color: #64748b;
          max-width: 700px;
          margin: 0 auto;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }

        .step-card {
          background: white;
          padding: 40px 30px;
          border-radius: 24px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .step-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: #e2e8f0;
        }

        .step-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          color: white;
          transition: transform 0.3s ease;
        }

        .step-card:hover .step-icon-wrapper {
          transform: rotate(10deg);
        }

        .step-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
        }

        .step-card p {
          color: #475569;
          line-height: 1.6;
          font-size: 1rem;
        }

        .how-bg-blob {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent);
          filter: blur(60px);
          z-index: 0;
        }

        .blob-1 { top: -100px; left: -100px; }
        .blob-2 { bottom: -100px; right: -100px; }

        @media (max-width: 768px) {
          .how-header h2 { font-size: 2.25rem; }
          .how-header p { font-size: 1.1rem; }
        }
      `}</style>

            <section className="how-it-works-section">
                <div className="how-bg-blob blob-1"></div>
                <div className="how-bg-blob blob-2"></div>

                <div className="how-wrapper">
                    <div className="how-header">
                        <h2>How Pawpal Works</h2>
                        <p>
                            Your journey to better pet healthcare in Sri Lanka is simple and secure.
                            Follow these steps to get started.
                        </p>
                    </div>

                    <div className="steps-grid">
                        {steps.map((step, index) => (
                            <div key={index} className="step-card">
                                <div
                                    className="step-icon-wrapper"
                                    style={{ backgroundColor: step.color }}
                                >
                                    {step.icon}
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default HowItWorks;
