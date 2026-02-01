import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Calendar,
  CheckCircle,
  ChevronRight,
  Star
} from "lucide-react";
import Navbar from "../components/Navbar"; // Adjust the path based on your project structure

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: <MapPin size={24} />,
      title: "Our Headquarters",
      description: "No. 123, Pet Care Avenue",
      details: "Colombo 07, Sri Lanka",
      color: "#10b981",
      badge: "Main Office",
    },
    {
      icon: <Phone size={24} />,
      title: "Phone Numbers",
      description: "+94 77 478 5555",
      details: "+94 11 234 5678",
      color: "#3b82f6",
      badge: "24/7 Support",
    },
    {
      icon: <Mail size={24} />,
      title: "Email Addresses",
      description: "hello@pawpal.lk",
      details: "support@pawpal.lk",
      color: "#8b5cf6",
      badge: "Quick Response",
    },
    {
      icon: <Clock size={24} />,
      title: "Working Hours",
      description: "Monday – Friday: 9 AM – 6 PM",
      details: "Saturday: 9 AM – 1 PM",
      color: "#f59e0b",
      badge: "Local Time",
    },
  ];

  const faqs = [
    {
      question: "How quickly will I receive a response?",
      answer: "We aim to respond to all inquiries within 24 hours during business days. Urgent matters are prioritized.",
      icon: "⏱️"
    },
    {
      question: "Can I schedule an appointment through the contact form?",
      answer: "For faster appointment bookings, please use our dedicated booking system. The contact form is for general inquiries.",
      icon: "📅"
    },
    {
      question: "Do you offer emergency veterinary services?",
      answer: "For emergencies, please call our emergency line directly at +94 77 478 5555. The contact form is for non-urgent matters.",
      icon: "🚨"
    },
    {
      question: "Can I contact specific departments?",
      answer: "Our team will route your inquiry to the appropriate department (Support, Technical, Partnerships, etc.) based on your message.",
      icon: "🎯"
    },
  ];

  return (
    <>
      <Navbar />
      
      <style>{`
        .contact-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Enhanced Hero Section */
        .contact-hero {
          padding: 8rem 2rem 6rem;
          background: 
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
            url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=700&fit=crop&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Animated Background Elements */
        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
          animation: pulse 8s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.6; transform: scale(1.05); }
        }

        .floating-paws {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: float 15s linear infinite;
        }

        .paw-1 { top: 20%; left: 10%; animation-delay: 0s; }
        .paw-2 { top: 60%; right: 15%; animation-delay: 3s; }
        .paw-3 { bottom: 30%; left: 20%; animation-delay: 6s; }

        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-100vh) rotate(360deg); }
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
          padding: 2rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(59, 130, 246, 0.9));
          backdrop-filter: blur(10px);
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .hero-badge .icon {
          color: white;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #ffffff, #e0f2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: rgba(255,255,255,0.95);
          max-width: 600px;
          margin: 0 auto 3rem;
          line-height: 1.7;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
          margin-top: 3rem;
        }

        .hero-stat {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #10b981;
          display: block;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: rgba(255,255,255,0.9);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Main Content */
        .contact-content {
          padding: 6rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Contact Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-bottom: 6rem;
        }

        /* Info Cards - Enhanced */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
          position: relative;
          display: inline-block;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 60px;
          height: 4px;
          background: linear-gradient(to right, #10b981, #3b82f6);
          border-radius: 2px;
        }

        .section-description {
          color: #64748b;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          font-size: 1.1rem;
        }

        .info-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          position: relative;
          overflow: hidden;
        }

        .info-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, var(--card-color), transparent);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .info-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(16, 185, 129, 0.15);
        }

        .info-card:hover::before {
          transform: scaleX(1);
        }

        .info-badge {
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
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }

        .info-card:hover .info-badge {
          opacity: 1;
          transform: translateY(0);
        }

        .info-icon {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--card-color)20, var(--card-color)40);
          color: var(--card-color);
          transition: all 0.3s ease;
        }

        .info-card:hover .info-icon {
          transform: scale(1.1) rotate(5deg);
          background: linear-gradient(135deg, var(--card-color), var(--card-color)80);
          color: white;
        }

        .info-details h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .info-details p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 0.25rem;
        }

        .info-details .details-secondary {
          color: #94a3b8;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Contact Form - Enhanced */
        .form-section {
          background: white;
          border-radius: 28px;
          padding: 3.5rem;
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.08);
          position: relative;
          overflow: hidden;
        }

        .form-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(to right, #10b981, #3b82f6, #8b5cf6);
          border-radius: 28px 28px 0 0;
        }

        .form-header {
          margin-bottom: 2.5rem;
        }

        .form-header h2 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .form-header p {
          color: #64748b;
          line-height: 1.6;
          font-size: 1.05rem;
        }

        .form-group {
          margin-bottom: 1.75rem;
          position: relative;
        }

        .form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .required {
          color: #ef4444;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 1.1rem;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f8fafc;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #10b981;
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .form-textarea {
          min-height: 150px;
          resize: vertical;
        }

        .submit-button {
          width: 100%;
          padding: 1.2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1rem;
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3);
        }

        .submit-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .success-message .icon {
          color: #10b981;
          flex-shrink: 0;
          animation: spin 1s ease;
        }

        @keyframes spin {
          from { transform: rotate(0deg) scale(0.5); }
          to { transform: rotate(360deg) scale(1); }
        }

        .success-message p {
          color: #065f46;
          font-weight: 500;
          line-height: 1.6;
        }

        /* FAQ Section */
        .faq-section {
          margin-top: 8rem;
        }

        .section-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 5rem;
        }

        .section-header h2 {
          font-size: 3rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
          position: relative;
          display: inline-block;
        }

        .section-header h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(to right, #10b981, #3b82f6);
          border-radius: 2px;
        }

        .section-subtitle {
          color: #64748b;
          font-size: 1.2rem;
          line-height: 1.7;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .faq-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .faq-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .faq-card h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .faq-icon {
          font-size: 1.5rem;
        }

        .faq-card p {
          color: #64748b;
          line-height: 1.7;
          font-size: 1rem;
          padding-left: 3rem;
        }

        /* Enhanced Map Section with Colombo Location */
        .map-section {
          margin-top: 8rem;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .map-container {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
        }

        .map-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .map-container:hover .map-image {
          transform: scale(1.05);
        }

        .map-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 3rem;
          z-index: 10;
        }

        .map-content {
          max-width: 800px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .map-info h3 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .map-info h3 .icon {
          color: #10b981;
        }

        .map-info p {
          font-size: 1.1rem;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .map-features {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .map-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .map-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          justify-self: end;
        }

        .map-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .contact-grid {
            gap: 3rem;
          }
          
          .map-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
          }

          .faq-grid {
            grid-template-columns: 1fr;
            max-width: 600px;
          }

          .hero-stats {
            gap: 2rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 6rem 1.5rem 4rem;
            min-height: 500px;
            background-attachment: scroll;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .contact-content {
            padding: 4rem 1.5rem;
          }

          .form-section {
            padding: 2.5rem;
          }

          .section-header h2 {
            font-size: 2.5rem;
          }

          .info-card {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }

          .info-icon {
            margin: 0 auto;
          }

          .map-overlay {
            padding: 2rem;
          }

          .map-info h3 {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-header h2 {
            font-size: 2rem;
          }

          .form-header h2 {
            font-size: 1.75rem;
          }

          .form-section {
            padding: 2rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1.5rem;
          }
        }
      `}</style>

      <div className="contact-page">
        {/* Enhanced Hero Section */}
        <section className="contact-hero">
          <div className="hero-pattern"></div>
          
          {/* Floating decorative elements */}
          <div className="floating-paws paw-1">🐾</div>
          <div className="floating-paws paw-2">🐾</div>
          <div className="floating-paws paw-3">🐾</div>
          
          <div className="hero-content">
            <div className="hero-badge">
              <MessageSquare className="icon" size={20} />
              <span>Get in Touch</span>
            </div>
            
            <h1 className="hero-title">
              Let's Connect & Care Together
            </h1>
            
            <p className="hero-subtitle">
              Your questions matter to us. Reach out to our dedicated team for personalized 
              support, expert advice, and seamless pet care solutions across Sri Lanka.
            </p>
            
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">24h</span>
                <span className="stat-label">Response Time</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Partner Clinics</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="contact-content">
          {/* Contact Grid */}
          <div className="contact-grid">
            {/* Left Column - Contact Information */}
            <div className="info-section">
              <h2 className="section-title">Our Contact Details</h2>
              <p className="section-description">
                Multiple ways to reach us. Choose what works best for you — 
                we're here to ensure your pet receives the best care possible.
              </p>
              
              {contactInfo.map((info, index) => (
                <div 
                  key={index} 
                  className="info-card"
                  style={{ '--card-color': info.color }}
                >
                  <span className="info-badge">{info.badge}</span>
                  <div className="info-icon">
                    {info.icon}
                  </div>
                  <div className="info-details">
                    <h3>{info.title}</h3>
                    <p>{info.description}</p>
                    <p className="details-secondary">
                      <ChevronRight size={14} />
                      {info.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Enhanced Contact Form */}
            <div className="form-section">
              <div className="form-header">
                <h2>Send Your Message</h2>
                <p>
                  Fill out this form with your details and inquiry. 
                  Our team will respond with personalized assistance 
                  tailored to your pet's needs.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Your Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} />
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare size={16} />
                    Inquiry Type <span className="required">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select inquiry type</option>
                    <option value="general">General Inquiry</option>
                    <option value="appointment">Appointment & Booking</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="emergency">Emergency Assistance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare size={16} />
                    Your Message <span className="required">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Please provide detailed information about your inquiry, including your pet's details if applicable..."
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  <Send size={20} />
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  <ChevronRight size={20} />
                </button>

                {submitted && (
                  <div className="success-message">
                    <CheckCircle className="icon" size={28} />
                    <p>
                      <strong>Message sent successfully!</strong><br />
                      Thank you for contacting Pawpal. We've received your message and 
                      our team will get back to you within 24 hours. For urgent matters, 
                      please call us directly.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Quick answers to common questions about contacting and working with Pawpal
              </p>
            </div>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-card">
                  <h3>
                    <span className="faq-icon">{faq.icon}</span>
                    {faq.question}
                  </h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Map Section with Colombo Location */}
          <div className="map-section">
            <div className="map-container">
              {/* Colombo Map Image */}
              <img 
                src="https://images.unsplash.com/photo-1621272035695-7d809b15d4c0?w=1600&h=500&fit=crop&q=80" 
                alt="Colombo City Map" 
                className="map-image"
              />
              
              <div className="map-overlay">
                <div className="map-content">
                  <div className="map-info">
                    <h3>
                      <MapPin className="icon" size={28} />
                      Visit Our Colombo Headquarters
                    </h3>
                    <p>
                      Located in the heart of Colombo, our headquarters serves as the central hub 
                      for all Pawpal operations. Conveniently accessible and equipped with modern 
                      facilities to serve you better.
                    </p>
                    <div className="map-features">
                      <div className="map-feature">
                        <Star size={14} />
                        <span>Prime Location</span>
                      </div>
                      <div className="map-feature">
                        <Clock size={14} />
                        <span>Easy Parking</span>
                      </div>
                      <div className="map-feature">
                        <Phone size={14} />
                        <span>Accessible</span>
                      </div>
                    </div>
                  </div>
                  <a 
                    href="https://goo.gl/maps/XYZ123Colombo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-button"
                  >
                    <MapPin size={20} />
                    Get Directions
                    <ChevronRight size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Add the missing User icon component
const User = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export default ContactUs;