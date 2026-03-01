import React, { useState } from "react";
import { ArrowRight, Clock, Calendar, X, Share2, Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const BlogSection = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedBlogs, setLikedBlogs] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["All", "Pet Health", "Prevention", "Nutrition"];

  const blogs = [
    {
      title: "Common Vaccinations Every Pet Owner in Sri Lanka Should Know",
      description:
        "A guide to core and non-core vaccines for dogs and cats, including rabies requirements and local schedules.",
      image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=800&q=80",
      route: "/tips/vaccinations",
      readTime: "6 min read",
      date: "Jan 15, 2025",
      category: "Pet Health"
    },
    {
      title: "How to Spot Early Signs of Illness in Your Dog or Cat",
      description:
        "Learn to recognize subtle changes in behavior, appetite, and appearance that might indicate your pet needs veterinary attention.",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
      route: "/tips/signs-of-illness",
      readTime: "5 min read",
      date: "Jan 10, 2025",
      category: "Prevention"
    },
    {
      title: "Safe Foods and Toxic Foods for Dogs and Cats",
      description:
        "A practical list of human foods that are safe, and dangerous, for your pets, with Sri Lankan context (e.g., jackfruit, curry leaves).",
      image: "https://www.harmonyanimalhospital.net/wp-content/uploads/2022/08/What-Fruits-Can-Dogs-Eat.jpg",
      route: "/tips/toxic-foods",
      readTime: "7 min read",
      date: "Jan 5, 2025",
      category: "Nutrition"
    },
  ];

  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (e, index) => {
    e.stopPropagation();
    setLikedBlogs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleShare = async (e, blog) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: window.location.origin + blog.route,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + blog.route);
      Swal.fire({
        icon: 'success',
        title: 'Link Copied!',
        text: 'The article link has been copied to your clipboard.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    Swal.fire({
      icon: 'success',
      title: 'Article Saved',
      text: 'This article has been added to your bookmarks.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <>
      <style>{`
        .blog-section {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 10px 20px 80px 20px;
          overflow: hidden;
        }

        .blog-bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%);
        }

        .blog-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .blog-header h2 {
          font-size: 3rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .blog-subtitle {
          font-size: 1.125rem;
          color: #475569;
          margin-top: 12px;
        }

        .category-filters {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 24px;
          border-radius: 50px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn.active {
          background: #10b981;
          color: white;
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .blog-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 30px;
          padding: 10px;
        }

        .blog-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          position: relative;
          border: 1px solid #f1f5f9;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .blog-image-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }

        .blog-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .blog-card:hover .blog-image {
          transform: scale(1.05);
        }

        .blog-category-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 20;
          background: rgba(255, 255, 255, 0.95);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #10b981;
          backdrop-filter: blur(4px);
        }

        .blog-card-actions {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;
          z-index: 20;
        }

        .action-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-icon-btn:hover {
          background: white;
          color: #10b981;
          transform: scale(1.1);
        }

        .action-icon-btn.liked {
          color: #ef4444;
        }

        .blog-content {
          padding: 24px;
        }

        .blog-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .blog-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .blog-card h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .blog-card p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }

        .blog-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .read-more-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #10b981;
          font-weight: 700;
          font-size: 0.95rem;
        }

        @media (max-width: 640px) {
          .blog-header h2 { font-size: 2.25rem; }
          .blog-container { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="blog-section" id="blog">
        <div className="blog-bg-pattern"></div>

        <div className="blog-wrapper">
          <div className="blog-header">
            <h2>PetCare Tips & Advice</h2>
            <p className="blog-subtitle">
              Expert articles to help you provide the best care for your furry friends.
            </p>
          </div>

          <div className="blog-container">
            {blogs.map((blog, index) => (
              <div
                className="blog-card"
                key={index}
                onClick={() => navigate(blog.route)}
              >
                <div className="blog-image-wrapper">
                  <div className="blog-category-tag">{blog.category}</div>
                  <img src={blog.image} alt={blog.title} className="blog-image" />
                </div>

                <div className="blog-content">
                  <div className="blog-meta">
                    <div className="blog-meta-item">
                      <Calendar size={14} />
                      <span>{blog.date}</span>
                    </div>
                    <div className="blog-meta-item">
                      <Clock size={14} />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>

                  <h3>{blog.title}</h3>
                  <p>{blog.description}</p>

                  <div className="blog-footer">
                    <div className="read-more-link">
                      <span>Read Article</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
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
