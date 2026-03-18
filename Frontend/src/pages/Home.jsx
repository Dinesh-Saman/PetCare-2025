import React from "react";
import "../styles/Home.css";

// Import components
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import PurposeSection from "../components/PurposeSection";
import HowItWorks from "../components/HowItWorks";
import CoreFeatures from "../components/CoreFeatures";
import Banner from "../components/Banner";

import BlogSection from "../components/BlogSection";
import AddPetModal from "./owner/AddPet";

const Home = () => {
  const [isAddPetModalOpen, setIsAddPetModalOpen] = React.useState(false);

  return (
    <div className="home-container">
      <Navbar />
      <HeroSection onAddPetClick={() => setIsAddPetModalOpen(true)} />
      <HowItWorks />
      <CoreFeatures />
      <Banner />

      <BlogSection />

      <AddPetModal 
        open={isAddPetModalOpen} 
        onClose={() => setIsAddPetModalOpen(false)} 
        onPetAdded={() => setIsAddPetModalOpen(false)}
      />
    </div>
  );
};

export default Home;
