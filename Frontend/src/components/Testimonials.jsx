import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const [itemsPerView, setItemsPerView] = useState(3);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const testimonials = [
    {
      name: "Dr. Janaki Collure",
      role: "Veterinarian, PetVet Clinic, Colombo",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Pawpal has transformed how we connect with pet owners. The in-app chat and appointment system make follow-ups seamless, and the AI chatbot provides reliable basic guidance before visits — highly recommended for busy clinics.",
      rating: 5,
    },
    {
      name: "Amara Silva",
      role: "Pet Owner, Negombo",
      image: "https://randomuser.me/api/portraits/women/28.jpg",
      text: "As a busy working mom, Pawpal's reminders for vaccinations and meds are a lifesaver. I booked my dog's check-up in seconds and chatted with the vet from home. My Labrador is healthier than ever!",
      rating: 5,
    },
    {
      name: "Dr. Chaminda Perera",
      role: "Senior Vet, Kandy Animal Hospital",
      image: "https://randomuser.me/api/portraits/men/35.jpg",
      text: "The pet profile sharing feature lets us access history instantly. Pawpal reduces no-shows with reminders and helps us focus on care rather than admin. A real game-changer for Sri Lankan vets.",
      rating: 5,
    },
    {
      name: "Ruwani Fernando",
      role: "Cat Parent & Caregiver, Galle",
      image: "https://randomuser.me/api/portraits/women/55.jpg",
      text: "I was worried about my senior cat's symptoms, but Pawpal's AI gave helpful nutrition and first-aid tips with clear 'see a vet' advice. Booked an appointment easily — now she's doing great!",
      rating: 5,
    },
    {
      name: "Dr. Nalinika Obeyesekere",
      role: "Founder Vet, Leading Clinic Colombo",
      image: "https://randomuser.me/api/portraits/women/40.jpg",
      text: "Pawpal bridges the gap for rural and urban pet owners alike. Secure chat, digital records, and preventive reminders improve compliance and outcomes. Excellent tool for modern veterinary practice.",
      rating: 5,
    },
    {
      name: "Tharindu Jayasinghe",
      role: "Dog Owner, Jaffna",
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      text: "Living far from specialists, Pawpal let me register my pet, get AI advice on diet, and book a virtual follow-up. The reminders kept us on track with flea treatment. Truly grateful!",
      rating: 5,
    },
    {
      name: "Dr. Vipuli Kulasekera",
      role: "Veterinarian, Colombo",
      image: "https://randomuser.me/api/portraits/men/50.jpg",
      text: "The platform's owner-vet communication is secure and efficient. Pet owners arrive better prepared, and we can mark records visible — saves time and builds trust.",
      rating: 5,
    },
    {
      name: "Sachini Weerasinghe",
      role: "Pet Parent, Anuradhapura",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      text: "Pawpal's nearby clinic finder and easy booking helped when my puppy had an emergency. The AI chatbot calmed me with first-aid steps until we reached the vet. Fantastic app!",
      rating: 5,
    },
    {
      name: "Sunil Rajapaksa",
      role: "Retired Engineer & Dog Dad, Kandy",
      image: "https://randomuser.me/api/portraits/men/65.jpg",
      text: "Even at my age, Pawpal is simple to use. I manage my dog's profiles, set reminders, and chat with the vet anytime. It's given me peace of mind and kept him healthy.",
      rating: 5,
    },
    {
      name: "Dilani Perera",
      role: "Clinic Staff & Cat Owner, Colombo",
      image: "https://randomuser.me/api/portraits/women/38.jpg",
      text: "We love how Pawpal streamlines registrations and appointments. Owners get reminders, we get organized records — it makes our days smoother and pets happier.",
      rating: 5,
    },
  ];

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  // Animation reset
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Auto-play carousel
  useEffect(() => {
    const autoPlay = setInterval(() => {
      if (currentIndex >= maxIndex) {
        setDirection("next");
        setIsAnimating(true);
        setCurrentIndex(0);
      } else {
        setDirection("next");
        setIsAnimating(true);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 5000);

    return () => clearInterval(autoPlay);
  }, [currentIndex, maxIndex]);

  const handleNext = () => {
    if (currentIndex < maxIndex && !isAnimating) {
      setDirection("next");
      setIsAnimating(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (currentIndex >= maxIndex && !isAnimating) {
      setDirection("next");
      setIsAnimating(true);
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isAnimating) {
      setDirection("prev");
      setIsAnimating(true);
      setCurrentIndex((prev) => prev - 1);
    } else if (currentIndex === 0 && !isAnimating) {
      setDirection("prev");
      setIsAnimating(true);
      setCurrentIndex(maxIndex);
    }
  };

  const handleDotClick = (index) => {
    if (!isAnimating && index !== currentIndex) {
      setDirection(index > currentIndex ? "next" : "prev");
      setIsAnimating(true);
      setCurrentIndex(index);
    }
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      handleNext();
    } else {
      handlePrev();
    }

    setTouchStartX(0);
    setTouchEndX(0);
  };

  return (
    <>
      <style>{`
        .testimonials-section {
          position: relative;
          background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 25%, #f0fdf4 50%, #fefce8 75%, #fefce8 100%);
          padding: 5rem 1.5rem;
          overflow: hidden;
        }

        .testimonials-bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: pulse 12s ease-in-out infinite;
        }

        .bg-blob-1 {
          top: 10%;
          left: 5%;
          width: 35vw;
          height: 35vw;
          background: rgba(16, 185, 129, 0.2);
        }

        .bg-blob-2 {
          bottom: 15%;
          right: 5%;
          width: 40vw;
          height: 40vw;
          background: rgba(59, 130, 246, 0.2);
          animation-delay: 3s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }

        .testimonials-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .testimonials-header h2 {
          font-size: clamp(2.2rem, 6vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin: 0;
        }

        .testimonials-gradient-text {
          background: linear-gradient(to right, #10b981, #14b8a6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .testimonials-subtitle {
          font-size: clamp(1rem, 3vw, 1.25rem);
          color: #475569;
          margin-top: 1.25rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .carousel-container {
          position: relative;
          padding: 0 3.5rem;
          width: 100%;
          overflow: hidden;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(16,185,129,0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .carousel-nav:hover:not(.disabled) {
          background: white;
          border-color: #10b981;
          transform: translateY(-50%) scale(1.15);
          box-shadow: 0 8px 25px rgba(16,185,129,0.25);
        }

        .carousel-nav.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .carousel-nav-prev { left: 0; }
        .carousel-nav-next { right: 0; }

        .carousel-track-container {
          overflow: visible;
          padding: 1rem 0;
          touch-action: pan-y;
          width: 100%;
          margin: 0 -0.5rem;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
          width: 100%;
        }

        .testimonial-slide {
          flex: 0 0 100%;
          min-width: 100%;
          box-sizing: border-box;
          padding: 0 0.5rem;
        }

        .testimonial-card-enhanced {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(16,185,129,0.12);
          border-radius: 1.5rem;
          padding: 2rem;
          height: 100%;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          width: 100%;
          margin: 0 auto;
        }

        .testimonial-card-enhanced:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.3);
        }

        .card-gradient-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, #10b981, #14b8a6, #3b82f6);
        }

        .quote-icon {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          opacity: 0.08;
          color: #10b981;
        }

        .testimonial-image-wrapper {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .testimonial-image-container {
          width: 90px;
          height: 90px;
          margin: 0 auto;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(16,185,129,0.15);
          transition: all 0.3s ease;
        }

        .testimonial-card-enhanced:hover .testimonial-image-container {
          border-color: #10b98180;
          transform: scale(1.08);
        }

        .testimonial-image-enhanced {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .testimonial-rating {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #10b981;
          color: white;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          font-size: 0.9rem;
          display: flex;
          gap: 3px;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        .star {
          color: #fcd34d;
        }

        .testimonial-content {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .testimonial-text-enhanced {
          color: #4b5563;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.4rem;
        }

        .testimonial-role-enhanced {
          color: #10b981;
          font-size: 0.9rem;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(16,185,129,0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot:hover {
          background: rgba(16,185,129,0.6);
        }

        .dot-active {
          width: 40px;
          background: linear-gradient(to right, #10b981, #14b8a6);
          border-radius: 999px;
        }

        /* Responsive adjustments */
        @media (min-width: 1024px) {
          .testimonial-slide {
            flex: 0 0 calc(100% / 3);
            min-width: calc(100% / 3);
          }
          .carousel-track {
            gap: 1.5rem;
          }
          .carousel-dots {
            display: none;
          }
          .carousel-track-container {
            margin: 0 -0.75rem;
          }
          .testimonial-slide {
            padding: 0 0.75rem;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .testimonial-slide {
            flex: 0 0 50%;
            min-width: 50%;
          }
          .carousel-track {
            gap: 1.5rem;
          }
          .carousel-track-container {
            margin: 0 -0.75rem;
          }
          .testimonial-slide {
            padding: 0 0.75rem;
          }
        }

        @media (max-width: 767px) {
          .testimonials-section { 
            padding: 3rem 0.5rem;
          }
          .carousel-container { 
            padding: 0 1.5rem;
          }
          .carousel-nav {
            width: 44px;
            height: 44px;
          }
          .carousel-track {
            gap: 0;
          }
          .testimonial-card-enhanced {
            padding: 1.5rem;
            border-radius: 1.25rem;
          }
          .testimonial-image-container { 
            width: 80px; 
            height: 80px; 
          }
          .testimonial-text-enhanced { 
            font-size: 0.95rem; 
            line-height: 1.6;
          }
          .testimonial-name { 
            font-size: 1.15rem; 
          }
          .carousel-dots { 
            gap: 6px; 
            margin-top: 2rem; 
          }
          .dot { 
            width: 8px; 
            height: 8px; 
          }
          .dot-active { 
            width: 24px; 
          }
          .carousel-track-container {
            margin: 0 -0.5rem;
          }
          .testimonial-slide {
            padding: 0 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .testimonials-header h2 { 
            font-size: 1.8rem; 
          }
          .testimonials-subtitle { 
            font-size: 0.95rem; 
            padding: 0 0.5rem;
          }
          .carousel-nav { 
            width: 40px; 
            height: 40px; 
          }
          .carousel-container { 
            padding: 0 1rem; 
          }
          .testimonial-card-enhanced {
            padding: 1.25rem;
          }
          .testimonial-text-enhanced { 
            font-size: 0.9rem; 
          }
          .testimonial-name { 
            font-size: 1.1rem; 
          }
          .testimonial-role-enhanced { 
            font-size: 0.85rem; 
          }
          .dot { 
            width: 6px; 
            height: 6px; 
          }
          .dot-active { 
            width: 20px; 
          }
        }
      `}</style>

      <section className="testimonials-section">
        <div className="testimonials-bg-effects">
          <div className="bg-blob bg-blob-1"></div>
          <div className="bg-blob bg-blob-2"></div>
        </div>

        <div className="testimonials-wrapper">
          <div className="testimonials-header">
            <h2>Trusted by Pet Owners &</h2>
            <h2 className="testimonials-gradient-text">Veterinarians Across Sri Lanka</h2>
            <p className="testimonials-subtitle">
              Heartwarming stories from vets, happy pet parents, and caregivers who use Pawpal every day
            </p>
          </div>

          <div className="carousel-container">
            <button
              onClick={handlePrev}
              className={`carousel-nav carousel-nav-prev ${currentIndex === 0 ? "disabled" : ""}`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              className={`carousel-nav carousel-nav-next ${currentIndex >= maxIndex ? "disabled" : ""}`}
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>

            <div
              className="carousel-track-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="carousel-track"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                  transition: isAnimating
                    ? "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)"
                    : "none",
                }}
              >
                {testimonials.map((item, index) => (
                  <div key={index} className="testimonial-slide">
                    <div className="testimonial-card-enhanced">
                      <div className="card-gradient-top"></div>
                      <Quote className="quote-icon" size={64} />
                      <div className="testimonial-image-wrapper">
                        <div className="testimonial-image-container">
                          <img
                            src={item.image}
                            alt={`${item.name} - ${item.role}`}
                            className="testimonial-image-enhanced"
                            loading="lazy"
                          />
                        </div>
                        <div className="testimonial-rating">
                          {[...Array(item.rating)].map((_, i) => (
                            <span key={i} className="star">★</span>
                          ))}
                        </div>
                      </div>
                      <div className="testimonial-content">
                        <p className="testimonial-text-enhanced">"{item.text}"</p>
                        <h3 className="testimonial-name">{item.name}</h3>
                        <p className="testimonial-role-enhanced">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="carousel-dots">
              {Array.from({ length: Math.ceil(testimonials.length / itemsPerView) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index * itemsPerView)}
                  className={`dot ${Math.floor(currentIndex / itemsPerView) === index ? "dot-active" : ""}`}
                  aria-label={`Go to testimonial group ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;