// src/components/VetFunctionalities.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ClipboardList,
  MessageSquare,
  CheckCircle,
  Hospital,
  Users
} from "lucide-react";

const VetFunctionalities = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  const functionalities = [
    {
      icon: <Calendar size={32} />,
      image: "https://i.imgur.com/qCGlaSU.png",
      title: "Smart Appointment Management",
      description: "Effortlessly manage your daily schedule. View today's appointments, confirm bookings, and handle rescheduling with just a few clicks.",
      color: "#8e24aa"
    },
    {
      icon: <ClipboardList size={32} />,
      image: "https://i.imgur.com/deLs7Ed.jpeg",
      title: "Digital Medical Records",
      description: "Access and update comprehensive patient histories, including vaccination records, past treatments, and long-term medication plans.",
      color: "#8e24aa"
    },
    {
      icon: <MessageSquare size={32} />,
      image: "https://i.imgur.com/nTlSSka.jpeg",
      title: "Direct Owner Messaging",
      description: "Integrated chat system to securely communicate with pet owners for follow-ups, results sharing, and professional guidance.",
      color: "#8e24aa"
    },
    {
      icon: <CheckCircle size={32} />,
      image: "https://i.imgur.com/MhdQNYw.png",
      title: "Registration Approvals",
      description: "Maintain control over your patient list by reviewing and approving new pet registration requests directly from your dashboard.",
      color: "#8e24aa"
    },
    {
      icon: <Hospital size={32} />,
      image: "https://i.imgur.com/7jv3hyo.jpeg",
      title: "Clinic Operations Control",
      description: "Manage multiple clinic locations, update facility details, and monitor overall practice performance from a centralized hub.",
      color: "#8e24aa"
    },
    {
      icon: <Users size={32} />,
      image: "https://i.imgur.com/athbigB.png",
      title: "Staff & Role Management",
      description: "Optimize your workflow by adding staff members, assigning roles, and managing permissions to ensure efficient clinical operations.",
      color: "#8e24aa"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            functionalities.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...new Set([...prev, index])]);
              }, index * 100);
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

  return (
    <>
      <style>{`
        .vet-functions-section {
          padding: 40px 20px 60px 20px;
          background: #fdfaff;
          position: relative;
        }
        .vet-functions-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }
        .vet-functions-header {
          text-align: center;
          margin-bottom: 70px;
        }
        .vet-functions-header h2 {
          font-size: 3rem;
          font-weight: 900;
          color: #49149e;
          margin-bottom: 20px;
        }
        .vet-functions-header p {
          font-size: 1.25rem;
          color: #6a5a8c;
          max-width: 800px;
          margin: 0 auto;
        }
        .vet-functions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .vet-func-card {
          background: white;
          border-radius: 32px;
          box-shadow: 0 10px 40px rgba(73, 20, 158, 0.05);
          border: 1px solid #f0e8ff;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0;
          transform: translateY(30px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .vet-func-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .vet-func-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 60px rgba(73, 20, 158, 0.12);
          border-color: #8e24aa;
        }
        .vet-img-container {
          width: 100%;
          height: 240px;
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
        }
        .vet-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .vet-func-card:hover .vet-img-container img {
          transform: scale(1.1);
        }
        .vet-card-content {
          padding: 32px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .vet-icon-container {
          width: 64px;
          height: 64px;
          background: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #49149e;
          position: absolute;
          top: -32px;
          left: 32px;
          box-shadow: 0 12px 24px rgba(73, 20, 158, 0.15);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(73, 20, 158, 0.1);
          z-index: 2;
        }
        .vet-func-card:hover .vet-icon-container {
          background: #49149e;
          color: white;
          transform: scale(1.1);
        }
        .vet-func-card h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 15px 0 15px;
        }
        .vet-func-card p {
          color: #64748b;
          line-height: 1.7;
          font-size: 1.05rem;
        }
        @media (max-width: 1100px) {
          .vet-functions-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .vet-functions-header h2 { font-size: 2.2rem; }
          .vet-functions-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <section className="vet-functions-section" ref={sectionRef}>
        <div className="vet-functions-wrapper">
          <div className="vet-functions-header">
            <h2>Your Digital Command Center</h2>
            <p>
              Experience the power of the Pawpal Vet Dashboard – designed by experts to streamline your clinical workflow and enhance pet care.
            </p>
          </div>
          <div className="vet-functions-grid">
            {functionalities.map((func, index) => (
              <div
                key={index}
                className={`vet-func-card ${visibleCards.includes(index) ? 'visible' : ''}`}
              >
                <div className="vet-img-container">
                  <img src={func.image} alt={func.title} />
                </div>
                <div className="vet-card-content">
                  <div className="vet-icon-container">
                    {func.icon}
                  </div>
                  <h3>{func.title}</h3>
                  <p>{func.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default VetFunctionalities;
