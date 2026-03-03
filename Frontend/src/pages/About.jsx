import React from "react";
import {
  Heart,
  Shield,
  Users,
  Target,
  CheckCircle,
  MapPin,
  Award,
  TrendingUp
} from "lucide-react";
import Navbar from "../components/Navbar"; // Adjust the path based on your project structure

const AboutUs = () => {
  return (
    <>
      <Navbar />

      <style>{`
        .about-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Hero Section with Clean Image */
        .about-hero {
          padding: 6rem 2rem 4rem; /* Adjusted for fixed navbar */
          margin-top: 96px; /* Matches desktop navbar */
          background: url('https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1600&h=800&fit=crop&q=80');
          background-size: cover;
          background-position: center;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Dark overlay for better text readability - subtle and clean */
        .about-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }

        .hero-content {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
          padding: 2rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .hero-badge .icon {
          color: #10b981;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255,255,255,0.95);
          max-width: 700px;
          margin: 0 auto 3rem;
          line-height: 1.7;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
        }

        /* Mission Section */
        .mission-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .mission-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .mission-highlight {
          color: #10b981;
          position: relative;
          display: inline-block;
        }

        .mission-highlight::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, #10b981, #3b82f6);
          border-radius: 2px;
        }

        .mission-text {
          color: #475569;
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .mission-points {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 2rem;
        }

        .mission-point {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .point-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .point-text h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .point-text p {
          color: #64748b;
          line-height: 1.6;
        }

        .mission-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.06);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1.5rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }

        /* Values Section */
        .values-section {
          padding: 6rem 2rem;
          background: white;
        }

        .section-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 4rem;
        }

        .section-header h2 {
          font-size: 2.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: #64748b;
          font-size: 1.15rem;
          line-height: 1.7;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .value-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          border: 1px solid rgba(16, 185, 129, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .value-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .value-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .value-card:hover::before {
          transform: scaleX(1);
        }

        .value-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #10b981;
        }

        .value-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .value-card p {
          color: #64748b;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        /* Story Section */
        .story-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          position: relative;
          overflow: hidden;
        }

        .story-container {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .story-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .story-header h2 {
          font-size: 2.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .story-timeline {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .story-timeline::before {
          content: '';
          position: absolute;
          left: 30px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #10b981, transparent);
        }

        .story-item {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
        }

        .story-year {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
          z-index: 10;
        }

        .story-content {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.08);
        }

        .story-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .story-content p {
          color: #64748b;
          line-height: 1.7;
        }

        /* Team Section - 4 members in one line */
        .team-section {
          padding: 6rem 2rem;
          background: white;
        }

        .team-section .section-header {
          margin-bottom: 4rem;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .team-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .team-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15);
        }

        .team-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .team-card:hover .team-image {
          transform: scale(1.05);
        }

        .team-info {
          padding: 2rem;
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .team-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .team-role {
          color: #10b981;
          font-weight: 500;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .team-bio {
          color: #64748b;
          line-height: 1.6;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .team-social {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #10b981;
          color: white;
          transform: translateY(-2px);
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%);
        }

        .cta-container {
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .cta-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.15rem;
          line-height: 1.7;
          margin-bottom: 3rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .cta-button.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
          }
        }

        @media (max-width: 1024px) {
          .mission-grid,
          .values-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .hero-title {
            font-size: 2.75rem;
          }

          .values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .about-hero {
            padding: 4rem 1.5rem 3rem;
            min-height: 400px;
            margin-top: 80px; /* Matches mobile navbar */
          }

          .hero-title {
            font-size: 2.25rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .mission-section,
          .values-section,
          .story-section,
          .team-section,
          .cta-section {
            padding: 4rem 1.5rem;
          }

          .section-header h2 {
            font-size: 2.25rem;
          }

          .cta-title {
            font-size: 2rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-button {
            width: 100%;
            max-width: 300px;
          }

          .team-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
          }

          .values-grid {
            grid-template-columns: 1fr;
          }

          .story-item {
            flex-direction: column;
            gap: 1rem;
          }

          .story-year {
            width: 50px;
            height: 50px;
            font-size: 1rem;
          }

          .story-timeline::before {
            left: 25px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-header h2 {
            font-size: 1.75rem;
          }

          .mission-content h2 {
            font-size: 2rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="about-page">
        {/* Hero Section with Clean Image - No blue overlay */}
        <section className="about-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <Heart className="icon" size={20} />
              <span>About Pawpal</span>
            </div>
            <h1 className="hero-title">
              Revolutionizing Pet Care in Sri Lanka
            </h1>
            <p className="hero-subtitle">
              Pawpal is Sri Lanka's premier digital platform connecting pet owners with veterinary care,
              combining cutting-edge technology with compassionate pet health management.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mission-section">
          <div className="mission-grid">
            <div className="mission-content">
              <h2>
                Our <span className="mission-highlight">Mission</span> & Vision
              </h2>
              <p className="mission-text">
                At Pawpal, we're on a mission to transform pet healthcare in Sri Lanka by making
                veterinary services accessible, affordable, and comprehensive for every pet owner.
              </p>
              <div className="mission-points">
                <div className="mission-point">
                  <div className="point-icon">
                    <Target size={24} />
                  </div>
                  <div className="point-text">
                    <h4>Accessible Veterinary Care</h4>
                    <p>Bridging the gap between urban and rural pet healthcare services across Sri Lanka</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="point-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="point-text">
                    <h4>Digital Innovation</h4>
                    <p>Leveraging AI and mobile technology to enhance pet health outcomes</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="point-icon">
                    <Users size={24} />
                  </div>
                  <div className="point-text">
                    <h4>Community Building</h4>
                    <p>Creating a supportive ecosystem for pet owners and veterinary professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="values-section">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p className="section-subtitle">
              The principles that guide every decision we make at Pawpal
            </p>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon-wrapper">
                <Heart size={32} />
              </div>
              <h3>Compassionate Care</h3>
              <p>Every pet deserves love and attention. We approach pet health with empathy and understanding.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-wrapper">
                <Shield size={32} />
              </div>
              <h3>Trust & Security</h3>
              <p>Your pet's data is protected with enterprise-grade security and strict privacy protocols.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-wrapper">
                <Target size={32} />
              </div>
              <h3>Innovation</h3>
              <p>Continuously improving our platform with cutting-edge technology for better pet care.</p>
            </div>
            <div className="value-card">
              <div className="value-icon-wrapper">
                <Users size={32} />
              </div>
              <h3>Community First</h3>
              <p>Building a supportive network where pet owners and vets can collaborate effectively.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-overlay"></div>
          <div className="cta-container">
            <h2 className="cta-title">Join Our Pet Care Revolution</h2>
            <p className="cta-subtitle">
              Whether you're a pet owner looking for better care or a veterinarian wanting to
              modernize your practice, Pawpal has something for you.
            </p>
            <div className="cta-buttons">
              <a href="/register" className="cta-button primary">
                Register Your Pet
              </a>
              <a href="/partner" className="cta-button secondary">
                Partner With Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;