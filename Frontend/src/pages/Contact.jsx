import React, { useState } from "react";
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  Phone,
  User as UserIcon
} from "lucide-react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import VetNavbar from "../components/VetNavbar";
import api from "../services/api"; // Added API service
import Swal from 'sweetalert2'; // Added for professional alerts

const ContactUs = () => {
  const location = useLocation();
  const isFromVet = location.state?.fromVet;

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

    try {
      const response = await api.post('/contact', formData);

      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });

        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'Thank you for reaching out. We have received your message.',
          timer: 3000,
          showConfirmButton: false
        });

        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Contact form error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.message || 'Something went wrong while sending your message. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isFromVet ? <VetNavbar /> : <Navbar />}

      <style>{`
        .contact-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%);
          font-family: 'Inter', sans-serif;
        }

        .contact-hero {
          padding: 6rem 2rem 4rem;
          margin-top: 96px; /* Matches desktop navbar */
          background: 
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
            url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=700&fit=crop&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: white;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
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
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: white;
        }

        .contact-content {
          padding: 6rem 2.5rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .form-section {
          background: white;
          border-radius: 28px;
          padding: 4rem;
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
        }

        .form-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .form-header h2 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .form-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 1.75rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
        }

        .required { color: #ef4444; }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 1.2rem;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          background: #f8fafc;
          transition: all 0.3s;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #10b981;
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .form-textarea { min-height: 160px; resize: vertical; }

        .submit-button {
          width: 100%;
          padding: 1.2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.3);
        }

        .success-message {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #166534;
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 4rem 1.5rem 2rem;
            margin-top: 80px; /* Matches mobile navbar */
            min-height: 300px;
            background-attachment: scroll; /* Fixed backgrounds often break on mobile */
          }
          .hero-title { font-size: 2.2rem; }
          .hero-badge { margin-bottom: 1.5rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; }
          .form-section { padding: 2rem; border-radius: 20px; }
          .contact-content { padding: 3rem 1.5rem; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 1.8rem; }
          .form-section { padding: 1.5rem; }
        }
      `}</style>

      <div className="contact-page">
        <section className="contact-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <MessageSquare size={20} />
              <span>Get in Touch</span>
            </div>

            <h1 className="hero-title">
              Let's Connect & Care Together
            </h1>
          </div>
        </section>

        <main className="contact-content">
          <div className="form-section">
            <div className="form-header">
              <h2>Send Your Message</h2>
              <p>
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={18} />
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} />
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
                  <MessageSquare size={18} />
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
                  <MessageSquare size={18} />
                  Your Message <span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="How can we help you?"
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
              </button>

              {submitted && (
                <div className="success-message">
                  <CheckCircle size={28} />
                  <p>
                    <strong>Message sent successfully!</strong><br />
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default ContactUs;
