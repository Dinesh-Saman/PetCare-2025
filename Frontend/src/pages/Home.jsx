import React from "react";
import "../styles/Home.css";

// Import components
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import CoreFeatures from "../components/CoreFeatures";
import Banner from "../components/Banner";
import Testimonials from "../components/Testimonials";
import BlogSection from "../components/BlogSection";
import Footer from "../components/Footer";
import ContactUs from "../components/ContactUs";
import BookAppointment from "../components/BookAppointment";

const Home = () => {
  return (
    <div className="home-container">
    <Navbar/>
      <HeroSection />
      <CoreFeatures />
      <BookAppointment/>
      <Banner />
      <Testimonials />
      <BlogSection />
      <ContactUs />
      <Footer/>
    </div>
  );
};

export default Home;
