import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: <MapPin size={22} />,
      label: "Our Location",
      value: "Negombo / Colombo Area,\nSri Lanka",
    },
    {
      icon: <Phone size={22} />,
      label: "Phone",
      value: "+94 77 478 5555",
    },
    {
      icon: <Mail size={22} />,
      label: "Email",
      value: "hello@pawpal.lk",
    },
    {
      icon: <Clock size={22} />,
      label: "Working Hours",
      value: "Monday – Friday\n9:00 AM – 6:00 PM",
    },
  ];

  return (
    <>
      <style>{`
        .contact-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%);
          padding: 6rem 2rem;
          min-height: 100vh;
        }

        .contact-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .contact-title {
          text-align: center;
          font-size: 2.6rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 1rem;
        }

        .contact-subtitle {
          text-align: center;
          color: #4b5563;
          font-size: 1.15rem;
          max-width: 680px;
          margin: 0 auto 4rem;
          line-height: 1.6;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          align-items: stretch;
          min-height: 540px;           /* helps balance visual height */
        }

        .info-column,
        .form-column {
          background: white;
          border-radius: 1.25rem;
          padding: 2.5rem;
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.06);
        }

        .info-column {
          display: flex;
          flex-direction: column;
        }

        .info-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 2rem;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          flex: 1;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .info-icon-box {
          width: 52px;
          height: 52px;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          flex-shrink: 0;
        }

        .info-text h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.3rem;
        }

        .info-text p {
          color: #6b7280;
          line-height: 1.5;
          white-space: pre-line;
        }

        .form-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.8rem;
          position: relative;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 1.15rem 1rem 0.95rem;
          border: 2px solid #d1d5db;
          border-radius: 0.75rem;
          font-size: 1.03rem;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
        }

        .form-textarea {
          min-height: 135px;
          resize: vertical;
        }

        .floating-label {
          position: absolute;
          left: 1rem;
          top: 1.1rem;
          font-size: 1rem;
          color: #9ca3af;
          pointer-events: none;
          transition: all 0.25s ease;
          background: white;
          padding: 0 0.35rem;
        }

        .form-input:focus + .floating-label,
        .form-input:not(:placeholder-shown) + .floating-label,
        .form-textarea:focus + .floating-label,
        .form-textarea:not(:placeholder-shown) + .floating-label {
          top: -0.55rem;
          font-size: 0.82rem;
          color: #10b981;
        }

        .submit-btn {
          width: 100%;
          padding: 1.15rem;
          background: linear-gradient(to right, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s;
          margin-top: 1rem;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(16, 185, 129, 0.3);
        }

        .success-msg {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          color: #065f46;
          border-radius: 0.75rem;
          text-align: center;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .contact-card {
            padding: 2.8rem 2rem;
          }
        }

        @media (max-width: 640px) {
          .contact-section {
            padding: 5rem 1.2rem;
          }
          .contact-title {
            font-size: 2.2rem;
          }
        }
      `}</style>

      <section className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">Get in Touch</h2>
          <p className="contact-subtitle">
            Have questions about Pawpal, your pet’s care, appointments, or just want to share feedback?  
            We're happy to hear from you!
          </p>

          <div className="contact-grid">
            {/* LEFT – Contact Details */}
            <div className="info-column">
              <h3 className="info-title">Contact Information</h3>

              <div className="info-list">
                {contactInfo.map((item, index) => (
                  <div key={index} className="info-row">
                    <div className="info-icon-box">{item.icon}</div>
                    <div className="info-text">
                      <h4>{item.label}</h4>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT – Form */}
            <div className="form-column">
              <h3 className="form-title">Send Us a Message</h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    className="form-input"
                  />
                  <label htmlFor="name" className="floating-label">Your Name</label>
                </div>

                <div className="form-group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    className="form-input"
                  />
                  <label htmlFor="email" className="floating-label">Email Address</label>
                </div>

                <div className="form-group">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    rows={5}
                    className="form-textarea"
                  />
                  <label htmlFor="message" className="floating-label">Your Message</label>
                </div>

                <button type="submit" className="submit-btn">
                  <Send size={18} />
                  <span>Send Message</span>
                </button>

                {submitted && (
                  <div className="success-msg">
                    Thank you! We’ll get back to you soon 🐾
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;