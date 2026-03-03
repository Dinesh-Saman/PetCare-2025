import React from "react";
import "../styles/Home.css";

// Import components
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import PurposeSection from "../components/PurposeSection";
import HowItWorks from "../components/HowItWorks";
import CoreFeatures from "../components/CoreFeatures";
import Banner from "../components/Banner";
import Testimonials from "../components/Testimonials";
import BlogSection from "../components/BlogSection";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <CoreFeatures />
      <Banner />
      <Testimonials />
      <BlogSection />
    </div>
  );
};

export default Home;
