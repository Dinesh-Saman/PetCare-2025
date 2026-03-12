// src/components/VetPurposeSection.jsx
import React from "react";
import { Shield, Zap, TrendingUp, HeartHandshake } from "lucide-react";

const VetPurposeSection = () => {
    const values = [
        {
            icon: <Shield size={32} />,
            title: "Professional Security",
            description: "Advanced data protection for your clinic's patient records and professional communications.",
            color: "#49149e"
        },
        {
            icon: <Zap size={32} />,
            title: "Operational Efficiency",
            description: "Reduce administrative overhead with automated bookings and streamlined digital medical records.",
            color: "#8e24aa"
        },
        {
            icon: <TrendingUp size={32} />,
            title: "Practice Growth",
            description: "Expand your reach and visibility to thousands of pet owners searching for care in Sri Lanka.",
            color: "#49149e"
        },
        {
            icon: <HeartHandshake size={32} />,
            title: "Enhanced Client Ties",
            description: "Build stronger relationships with pet owners through direct, meaningful digital engagement.",
            color: "#8e24aa"
        }
    ];

    return (
        <>
            <style>{`
        .vet-purpose {
          padding: 60px 20px;
          background: white;
        }
        .vet-purpose-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }
        .vet-purpose-header {
          text-align: center;
          margin-bottom: 70px;
        }
        .vet-purpose-header h2 {
          font-size: 3rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 25px;
        }
        .vet-purpose-header p {
          font-size: 1.25rem;
          color: #64748b;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .vet-purpose-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }
        .vet-purpose-card {
          padding: 40px;
          background: #fcfaff;
          border-radius: 30px;
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          text-align: center;
        }
        .vet-purpose-card:hover {
          transform: translateY(-8px);
          background: white;
          box-shadow: 0 20px 40px rgba(73, 20, 158, 0.08);
          border-color: #49149e;
        }
        .vet-purpose-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 25px;
        }
        .vet-purpose-card h3 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 15px;
        }
        .vet-purpose-card p {
          color: #475569;
          line-height: 1.6;
        }
      `}</style>
            <section className="vet-purpose">
                <div className="vet-purpose-wrapper">
                    <div className="vet-purpose-header">
                        <h2>Why Join Our Professional Network?</h2>
                        <p>
                            We are empowering Sri Lankan veterinarians to lead the digital transformation of pet healthcare with tools built for professional excellence.
                        </p>
                    </div>
                    <div className="vet-purpose-grid">
                        {values.map((v, i) => (
                            <div key={i} className="vet-purpose-card">
                                <div className="vet-purpose-icon" style={{ background: v.color }}>
                                    {v.icon}
                                </div>
                                <h3>{v.title}</h3>
                                <p>{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default VetPurposeSection;
