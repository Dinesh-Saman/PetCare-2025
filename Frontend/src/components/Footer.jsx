import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  PawPrint,
  Shield,
  HeartHandshake,
} from "lucide-react";

const Footer = () => {
  const handleNavigation = (path) => {
    console.log(`Navigate to: ${path}`);
  };

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        /* Unique animation names */
        @keyframes pawpalFadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pawpalHeartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes pawpalFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        /* Footer wrapper */
        .pawpal-footer-wrapper {
          width: 100%;
          margin-top: auto;
          position: relative;
        }
        
        .pawpal-footer {
          background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
          color: white;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .pawpal-footer-top-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #10b981, #059669, #047857, #065f46);
        }
        
        .pawpal-footer-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 80px 100px 40px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr;
          gap: 60px;
          position: relative;
          z-index: 10;
          width: 100%;
          box-sizing: border-box;
          align-items: start;
        }
        
        .pawpal-footer-section {
          animation: pawpalFadeInUp 0.8s ease-out backwards;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .pawpal-footer-section:nth-child(1) { animation-delay: 0.1s; }
        .pawpal-footer-section:nth-child(2) { animation-delay: 0.2s; }
        .pawpal-footer-section:nth-child(3) { animation-delay: 0.3s; }
        
        /* Logo Section */
        .pawpal-logo-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .pawpal-logo-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          animation: pawpalFloat 3s ease-in-out infinite;
        }
        
        .pawpal-logo-text {
          display: flex;
          flex-direction: column;
        }
        
        .pawpal-logo-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #d1fae5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        
        .pawpal-logo-subtitle {
          font-size: 0.85rem;
          color: #a7f3d0;
          font-weight: 500;
          letter-spacing: 1px;
        }
        
        /* Section Title */
        .pawpal-section-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #fff 0%, #d1fae5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          display: inline-block;
        }
        
        .pawpal-section-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 50px;
          height: 3px;
          background: linear-gradient(to right, #10b981, #059669);
          border-radius: 2px;
        }
        
        /* Description */
        .pawpal-description {
          color: #cbd5e1;
          line-height: 1.7;
          font-size: 0.95rem;
          margin-bottom: 24px;
          flex-grow: 1;
        }
        
        /* Trust Badges */
        .pawpal-trust-badges {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .pawpal-trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.15);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #a7f3d0;
        }
        
        /* Quick Links */
        .pawpal-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          flex-grow: 1;
        }
        
        .pawpal-link-list li {
          margin-bottom: 14px;
        }
        
        .pawpal-link-button {
          background: none;
          border: none;
          color: #cbd5e1;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          position: relative;
          padding-left: 20px;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          width: 100%;
        }
        
        .pawpal-link-button::before {
          content: '🐾';
          position: absolute;
          left: 0;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        
        .pawpal-link-button:hover {
          color: white;
          padding-left: 28px;
        }
        
        .pawpal-link-button:hover::before {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* Contact Section */
        .pawpal-contact-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        
        .pawpal-contact-items {
          flex-grow: 1;
        }
        
        .pawpal-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #cbd5e1;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .pawpal-contact-item:hover {
          color: white;
          transform: translateX(4px);
        }
        
        .pawpal-contact-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34d399;
          transition: all 0.3s ease;
        }
        
        .pawpal-contact-item:hover .pawpal-contact-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          transform: scale(1.1);
        }
        
        /* Social Icons */
        .pawpal-social-icons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        
        .pawpal-social-icon {
          width: 44px;
          height: 44px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34d399;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .pawpal-social-icon:hover {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Newsletter */
        .pawpal-newsletter {
          margin-top: 20px;
        }
        
        .pawpal-newsletter-title {
          font-size: 1rem;
          color: #94a3b8;
          margin-bottom: 12px;
        }
        
        .pawpal-newsletter-form {
          display: flex;
          gap: 8px;
        }
        
        .pawpal-newsletter-input {
          flex-grow: 1;
          padding: 10px 16px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }
        
        .pawpal-newsletter-input::placeholder {
          color: #94a3b8;
        }
        
        .pawpal-newsletter-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .pawpal-newsletter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        
        /* Divider */
        .pawpal-footer-divider {
          max-width: 1400px;
          margin: 0 auto;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(16, 185, 129, 0.3), transparent);
          position: relative;
          z-index: 10;
        }
        
        /* Bottom Section */
        .pawpal-bottom-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 40px;
          text-align: center;
          position: relative;
          z-index: 10;
          width: 100%;
          box-sizing: border-box;
        }
        
        .pawpal-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .pawpal-copyright {
          color: #94a3b8;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .pawpal-heart-icon {
          color: #f472b6;
          animation: pawpalHeartbeat 1.5s ease-in-out infinite;
        }
        
        .pawpal-bottom-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .pawpal-bottom-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }
        
        .pawpal-bottom-link:hover {
          color: #34d399;
          text-decoration: underline;
        }
        
        /* Desktop-specific margins */
        .pawpal-quick-links-section {
          margin-left: 50px;
        }
        
        .pawpal-contact-section {
          margin-left: 80px;
        }
        
        /* Mobile Responsive Styles */
        
        /* Tablet (968px and below) */
        @media (max-width: 968px) {
          .pawpal-footer-main {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 60px 30px 30px;
          }
          
          .pawpal-bottom-section {
            padding: 24px 30px;
          }
          
          .pawpal-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          
          .pawpal-bottom-links {
            justify-content: center;
          }
          
          .pawpal-footer-section {
            height: auto;
            min-height: auto;
          }
          
          /* Remove desktop margins */
          .pawpal-quick-links-section {
            margin-left: 0 !important;
          }
          
          .pawpal-contact-section {
            margin-left: 0 !important;
          }
          
          /* Center content */
          .pawpal-logo-section {
            flex-direction: column;
            align-items: center !important;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .pawpal-logo-icon {
            margin-bottom: 10px;
          }
          
          .pawpal-section-title {
            text-align: center;
            display: block;
          }
          
          .pawpal-section-title::after {
            left: 50%;
            transform: translateX(-50%);
          }
          
          .pawpal-description {
            text-align: center;
          }
          
          .pawpal-trust-badges {
            justify-content: center;
          }
          
          .pawpal-social-icons {
            justify-content: center;
          }
          
          .pawpal-newsletter-form {
            justify-content: center;
          }
        }
        
        /* Small Tablet (768px and below) */
        @media (max-width: 768px) {
          .pawpal-footer-main {
            padding: 50px 25px 25px;
            gap: 35px;
          }
          
          .pawpal-section-title {
            font-size: 1.35rem;
          }
          
          .pawpal-logo-title {
            font-size: 1.8rem;
          }
          
          .pawpal-logo-icon {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }
        }
        
        /* Mobile (640px and below) */
        @media (max-width: 640px) {
          .pawpal-footer-main {
            padding: 40px 20px 20px;
            gap: 30px;
          }
          
          .pawpal-section-title {
            font-size: 1.25rem;
          }
          
          .pawpal-social-icon {
            width: 40px;
            height: 40px;
          }
          
          .pawpal-bottom-section {
            padding: 20px;
          }
          
          .pawpal-bottom-links {
            gap: 16px;
            justify-content: center;
          }
          
          .pawpal-contact-icon {
            width: 32px;
            height: 32px;
            min-width: 32px;
          }
          
          .pawpal-description {
            font-size: 0.9rem;
          }
          
          .pawpal-link-button {
            font-size: 0.9rem;
          }
          
          .pawpal-contact-item {
            font-size: 0.9rem;
          }
          
          .pawpal-social-icons {
            justify-content: center;
          }
          
          .pawpal-newsletter-form {
            flex-direction: column;
          }
        }
        
        /* Small Mobile (480px and below) */
        @media (max-width: 480px) {
          .pawpal-footer-main {
            padding: 30px 16px 16px;
            gap: 25px;
          }
          
          .pawpal-logo-section {
            gap: 8px;
          }
          
          .pawpal-section-title {
            font-size: 1.15rem;
          }
          
          .pawpal-copyright {
            font-size: 0.8rem;
          }
          
          .pawpal-bottom-link {
            font-size: 0.8rem;
          }
          
          .pawpal-link-button {
            justify-content: center;
            padding-left: 0;
          }
          
          .pawpal-link-button::before {
            display: none;
          }
          
          .pawpal-logo-title {
            font-size: 1.6rem;
          }
        }
        
        /* Extra Small Mobile (360px and below) */
        @media (max-width: 360px) {
          .pawpal-footer-main {
            padding: 25px 12px 12px;
          }
          
          .pawpal-bottom-section {
            padding: 16px 12px;
          }
          
          .pawpal-social-icons {
            gap: 8px;
          }
          
          .pawpal-social-icon {
            width: 36px;
            height: 36px;
          }
          
          .pawpal-logo-icon {
            width: 44px;
            height: 44px;
            font-size: 1.4rem;
          }
          
          .pawpal-contact-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
          }
          
          .pawpal-contact-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
          }
        }
      `}</style>

      <div className="pawpal-footer-wrapper">
        <footer className="pawpal-footer">
          <div className="pawpal-footer-top-border"></div>
          
          <div className="pawpal-footer-main">
            {/* About Section */}
            <div className="pawpal-footer-section">
              <div className="pawpal-logo-section">
                <div className="pawpal-logo-icon">
                  <PawPrint size={28} />
                </div>
                <div className="pawpal-logo-text">
                  <h1 className="pawpal-logo-title">PawPal</h1>
                  <p className="pawpal-logo-subtitle">PET CARE MANAGEMENT</p>
                </div>
              </div>
              <p className="pawpal-description">
                Your trusted partner in pet wellness. PawPal offers comprehensive 
                pet care management solutions including health tracking, appointment 
                scheduling, nutrition planning, and 24/7 veterinary support. 
                Because every pet deserves the best care.
              </p>
              <div className="pawpal-trust-badges">
                <div className="pawpal-trust-badge">
                  <Shield size={14} />
                  <span>Vet Verified</span>
                </div>
                <div className="pawpal-trust-badge">
                  <HeartHandshake size={14} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="pawpal-footer-section pawpal-quick-links-section">
              <h3 className="pawpal-section-title">Quick Links</h3>
              <ul className="pawpal-link-list">
                <li>
                  <button className="pawpal-link-button" onClick={() => handleNavigation('/')}>
                    Home
                  </button>
                </li>
                <li>
                  <button className="pawpal-link-button" onClick={() => handleNavigation('/about')}>
                    About Us
                  </button>
                </li>
                <li>
                  <button className="pawpal-link-button" onClick={() => handleNavigation('/services')}>
                    Our Services
                  </button>
                </li>
                <li>
                  <button className="pawpal-link-button" onClick={() => handleNavigation('/contact')}>
                    Contact Us
                  </button>
                </li>
                <li>
                  <button className="pawpal-link-button" onClick={() => handleNavigation('/blog')}>
                    Pet Care Blog
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="pawpal-footer-section pawpal-contact-section">
              <div className="pawpal-contact-content">
                <h3 className="pawpal-section-title">Contact Us</h3>
                <div className="pawpal-contact-items">
                  <div className="pawpal-contact-item">
                    <div className="pawpal-contact-icon"><MapPin size={18} /></div>
                    <span>123 Pet Care Avenue,<br />Colombo 05, Sri Lanka</span>
                  </div>
                  <div className="pawpal-contact-item">
                    <div className="pawpal-contact-icon"><Phone size={18} /></div>
                    <span>+94 11 234 5678<br />Emergency: +94 77 890 1234</span>
                  </div>
                  <div className="pawpal-contact-item">
                    <div className="pawpal-contact-icon"><Mail size={18} /></div>
                    <span>hello@pawpal.lk<br />support@pawpal.lk</span>
                  </div>
                </div>
                <div className="pawpal-social-icons">
                  <a href="#" aria-label="Facebook" className="pawpal-social-icon">
                    <Facebook size={20} />
                  </a>
                  <a href="#" aria-label="Instagram" className="pawpal-social-icon">
                    <Instagram size={20} />
                  </a>
                  <a href="#" aria-label="Twitter" className="pawpal-social-icon">
                    <Twitter size={20} />
                  </a>
                  <a href="#" aria-label="YouTube" className="pawpal-social-icon">
                    <Youtube size={20} />
                  </a>
                </div>
                <div className="pawpal-newsletter">
                  <p className="pawpal-newsletter-title">Join Our Pet Community</p>
                  <form className="pawpal-newsletter-form">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="pawpal-newsletter-input"
                    />
                    <button type="submit" className="pawpal-newsletter-button">
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="pawpal-footer-divider"></div>

          <div className="pawpal-bottom-section">
            <div className="pawpal-bottom-content">
              <p className="pawpal-copyright">
                © {currentYear} PawPal Pet Care. Made with <Heart className="pawpal-heart-icon" size={14} fill="#f472b6" /> for pets worldwide
              </p>
              <div className="pawpal-bottom-links">
                <a href="#" className="pawpal-bottom-link">Terms & Conditions</a>
                <a href="#" className="pawpal-bottom-link">Privacy Policy</a>
                <a href="#" className="pawpal-bottom-link">Cookie Policy</a>
                <a href="#" className="pawpal-bottom-link">Accessibility</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Footer;