import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css'; // We'll create this CSS next

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* About Section */}
                <div className="footer-section">
                    <h3 className="footer-title">About PawPal</h3>
                    <p>
                        PawPal is a modern veterinary management platform designed to connect pet owners with trusted clinics, 
                        streamline appointments, manage medical records, and provide the best care for your beloved pets.
                    </p>
                </div>

                {/* Quick Links Section */}
                <div className="footer-section">
                    <h3 className="footer-title">Quick Links</h3>
                    <ul className="footer-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Our Services</a></li>
                        <li><a href="/clinics">Find a Clinic</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Contact & Social Media */}
                <div className="footer-section">
                    <h3 className="footer-title">Contact Us</h3>
                    <div className="contact-info">
                        <p><FaMapMarkerAlt /> 123 Pet Street, Colombo, Sri Lanka</p>
                        <p><FaPhone /> +94 11 234 5678</p>
                        <p><FaEnvelope /> support@pawpal.lk</p>
                    </div>

                    {/* Social Media Links */}
                    <div className="footer-social">
                        <a href="https://facebook.com/pawpal" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaFacebookF />
                        </a>
                        <a href="https://twitter.com/pawpal" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaTwitter />
                        </a>
                        <a href="https://instagram.com/pawpal" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaInstagram />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <p>&copy; {currentYear} PawPal Veterinary System. All Rights Reserved.</p>
                <p>Made with ❤️ for pets and their humans</p>
            </div>
        </footer>
    );
}

export default Footer;