import React, { useState } from "react";
import { ArrowRight, Clock, Calendar } from "lucide-react";

const BlogSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const blogs = [
    {
      title: "Common Vaccinations Every Pet Owner in Sri Lanka Should Know",
      description:
        "A guide to core and non-core vaccines for dogs and cats, including rabies requirements and local schedules.",
      image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=80",
      link: "/blog/vaccinations-sri-lanka",
      readTime: "6 min read",
      date: "Jan 15, 2025",
      category: "Pet Health Basics"
    },
    {
      title: "How to Spot Early Signs of Illness in Your Dog or Cat",
      description:
        "Learn to recognize subtle changes in behavior, appetite, and appearance that might indicate your pet needs veterinary attention.",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
      link: "/blog/early-signs-illness",
      readTime: "5 min read",
      date: "Jan 10, 2025",
      category: "Prevention"
    },
    {
      title: "Safe Foods and Toxic Foods for Dogs and Cats",
      description:
        "A practical list of human foods that are safe — and dangerous — for your pets, with Sri Lankan context (e.g., jackfruit, curry leaves).",
      image:"https://www.harmonyanimalhospital.net/wp-content/uploads/2022/08/What-Fruits-Can-Dogs-Eat.jpg",
      link: "/blog/safe-toxic-foods",
      readTime: "7 min read",
      date: "Jan 5, 2025",
      category: "Nutrition"
    },
  ];

  return (
    <>
      <style>{`
        .blog-section {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%);
          padding: 100px 20px;
          overflow: hidden;
        }

        .blog-bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
        }

        .blog-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 80px;
          animation: fadeInDown 0.8s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .blog-header h2 {
          font-size: 3.5rem;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 16px;
          position: relative;
          display: inline-block;
        }

        .blog-header h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          background: linear-gradient(to right, #10b981, #3b82f6);
          border-radius: 2px;
        }

        .blog-subtitle {
          font-size: 1.125rem;
          color: #475569;
          margin-top: 24px;
        }

        .blog-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
          padding: 20px;
        }

        .blog-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          animation: fadeInUp 0.6s ease-out backwards;
          cursor: pointer;
          position: relative;
        }

        .blog-card:nth-child(1) { animation-delay: 0.1s; }
        .blog-card:nth-child(2) { animation-delay: 0.2s; }
        .blog-card:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .blog-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .blog-image-wrapper {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
        }

        .blog-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-image {
          transform: scale(1.1);
        }

        .blog-category {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          color: #10b981;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        .blog-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .blog-card:hover .blog-image-overlay {
          opacity: 1;
        }

        .blog-content {
          padding: 32px;
        }

        .blog-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          color: #64748b;
          font-size: 0.875rem;
        }

        .blog-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .blog-meta-icon {
          width: 16px;
          height: 16px;
        }

        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 12px;
          line-height: 1.4;
          transition: color 0.3s ease;
        }

        .blog-card:hover .blog-content h3 {
          color: #10b981;
        }

        .blog-content p {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .blog-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          position: relative;
          overflow: hidden;
        }

        .blog-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .blog-button:hover::before {
          opacity: 1;
        }

        .blog-button span,
        .blog-button-icon {
          position: relative;
          z-index: 1;
        }

        .blog-button-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .blog-button:hover .blog-button-icon {
          transform: translateX(4px);
        }

        .blog-button:hover {
          box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
          transform: translateY(-2px);
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%);
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
        }

        .floating-shape-1 {
          width: 150px;
          height: 150px;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .floating-shape-2 {
          width: 200px;
          height: 200px;
          bottom: 15%;
          right: 8%;
          animation-delay: 2s;
        }

        .floating-shape-3 {
          width: 100px;
          height: 100px;
          top: 60%;
          left: 10%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        @media (max-width: 768px) {
          .blog-section {
            padding: 60px 15px;
          }

          .blog-header h2 {
            font-size: 2.5rem;
          }

          .blog-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .blog-image-wrapper {
            height: 220px;
          }

          .blog-content {
            padding: 24px;
          }
        }
      `}</style>

      <section className="blog-section">
        <div className="blog-bg-pattern"></div>

        <div className="floating-shape floating-shape-1"></div>
        <div className="floating-shape floating-shape-2"></div>
        <div className="floating-shape floating-shape-3"></div>

        <div className="blog-wrapper">
          <div className="blog-header">
            <h2>Pet Care Tips & Advice</h2>
            <p className="blog-subtitle">
              Helpful articles to keep your pets healthy and happy — from Pawpal
            </p>
          </div>

          <div className="blog-container">
            {blogs.map((blog, index) => (
              <div
                className="blog-card"
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="blog-image-wrapper">
                  <div className="blog-category">{blog.category}</div>
                  <img src={blog.image} alt={blog.title} className="blog-image" />
                  <div className="blog-image-overlay"></div>
                </div>

                <div className="blog-content">
                  <div className="blog-meta">
                    <div className="blog-meta-item">
                      <Calendar className="blog-meta-icon" />
                      <span>{blog.date}</span>
                    </div>
                    <div className="blog-meta-item">
                      <Clock className="blog-meta-icon" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>

                  <h3>{blog.title}</h3>
                  <p>{blog.description}</p>

                  <a href={blog.link} className="blog-button">
                    <span>Read Article</span>
                    <ArrowRight className="blog-button-icon" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSection;