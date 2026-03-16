// src/pages/vet/VetHome.jsx
import React from "react";
import VetNavbar from "../../components/VetNavbar";
import VetHeroSection from "../../components/VetHeroSection";
import VetFunctionalities from "../../components/VetFunctionalities";
import VetPurposeSection from "../../components/VetPurposeSection";



const VetHome = () => {
  return (
    <div className="vet-home-container" style={{ background: '#ffffff' }}>
      <VetNavbar />
      <VetHeroSection />
      
      <VetPurposeSection />

      <VetFunctionalities />
      



    </div>
  );
};

export default VetHome;
