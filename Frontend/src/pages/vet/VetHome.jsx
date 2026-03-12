// src/pages/vet/VetHome.jsx
import React from "react";
import VetNavbar from "../../components/VetNavbar";
import VetHeroSection from "../../components/VetHeroSection";
import VetFunctionalities from "../../components/VetFunctionalities";
import VetPurposeSection from "../../components/VetPurposeSection";
import HowItWorks from "../../components/HowItWorks";
import Footer from "../../components/Footer";

const VetHome = () => {
  return (
    <div className="vet-home-container" style={{ background: '#ffffff' }}>
      <VetNavbar />
      <VetHeroSection />
      
      <VetPurposeSection />

      <VetFunctionalities />
      
      <div style={{ borderTop: '1px solid #f0f0f0' }}>
        <HowItWorks />
      </div>

      <Footer />
    </div>
  );
};

export default VetHome;
