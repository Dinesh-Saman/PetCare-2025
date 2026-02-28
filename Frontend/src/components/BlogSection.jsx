import React, { useState } from "react";
import { ArrowRight, Clock, Calendar, X, Share2, Bookmark, Heart } from "lucide-react";
import Swal from 'sweetalert2';

const BlogSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
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
      content: `
        <p>In Sri Lanka, keeping your pets vaccinated is not just a health choice—it's often a legal requirement, especially for Rabies. The tropical climate also brings specific challenges like Parvovirus and Distemper which are highly prevalent.</p>
        <h4>Core Vaccines for Dogs</h4>
        <ul>
          <li><strong>Rabies:</strong> Required by law. First dose at 3 months, followed by annual boosters.</li>
          <li><strong>DHLPP:</strong> Protects against Distemper, Hepatitis, Leptospirosis, Parainfluenza, and Parvovirus.</li>
        </ul>
        <h4>Core Vaccines for Cats</h4>
        <ul>
          <li><strong>Tricat/FVRCP:</strong> Protects against Feline Viral Rhinotracheitis, Calicivirus, and Panleukopenia.</li>
          <li><strong>Rabies:</strong> Essential for outdoor cats in Sri Lanka.</li>
        </ul>
        <p>Consult your local vet in Colombo or Kandy to ensure your pet follows the Department of Animal Production and Health (DAPH) guidelines.</p>
      `,
      link: "#",
      readTime: "6 min read",
      date: "Jan 15, 2025",
      category: "Pet Health"
    },
    {
      title: "How to Spot Early Signs of Illness in Your Dog or Cat",
      description:
        "Learn to recognize subtle changes in behavior, appetite, and appearance that might indicate your pet needs veterinary attention.",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
      content: `
        <p>Pets are masters at hiding pain and illness. As a responsible owner in Sri Lanka, you need to be observant of subtle shifts.</p>
        <h4>Key Warning Signs:</h4>
        <ul>
          <li><strong>Changes in Appetite:</strong> Sudden loss of interest in food or water is often the first sign of trouble.</li>
          <li><strong>Lethargy:</strong> If your usually active pet is sleeping excessively or avoids play.</li>
          <li><strong>Abnormal Vocalization:</strong> Whining, or unusual meowing can signal discomfort.</li>
          <li><strong>Changes in Grooming:</strong> Cats may stop grooming, or dogs may obsessively lick a specific spot.</li>
        </ul>
        <p>If you notice these signs for more than 24 hours, use Pawpal to book an appointment with your registered clinic immediately.</p>
      `,
      link: "#",
      readTime: "5 min read",
      date: "Jan 10, 2025",
      category: "Prevention"
    },
    {
      title: "Safe Foods and Toxic Foods for Dogs and Cats",
      description:
        "A practical list of human foods that are safe — and dangerous — for your pets, with Sri Lankan context (e.g., jackfruit, curry leaves).",
      image: "https://www.harmonyanimalhospital.net/wp-content/uploads/2022/08/What-Fruits-Can-Dogs-Eat.jpg",
      content: `
        <p>Feeding table scraps is common in Sri Lankan households, but many traditional ingredients are toxic to pets.</p>
        <h4>Toxic Foods to Avoid:</h4>
        <ul>
          <li><strong>Onions & Garlic:</strong> Common in curries, these can cause anemia in dogs and cats.</li>
          <li><strong>Chocolate & Caffeine:</strong> Highly toxic to the nervous system.</li>
          <li><strong>Grapes & Raisins:</strong> Can lead to kidney failure.</li>
          <li><strong>Excessive Spices:</strong> Chili and heavy spices cause severe digestive upset.</li>
        </ul>
        <h4>Safe Treats (in moderation):</h4>
        <ul>
          <li><strong>Boiled Chicken:</strong> Excellent source of protein.</li>
          <li><strong>Cooked Pumpkin:</strong> Great for digestion.</li>
          <li><strong>Papaya:</strong> A safe Sri Lankan fruit (remove seeds).</li>
        </ul>
      `,
      link: "#",
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
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
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
          padding: 80px 20px;
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

        /* Modal Styles */
        .blog-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .blog-modal {
          background: white;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          border-radius: 24px;
          overflow-y: auto;
          position: relative;
          animation: modalIn 0.3s ease-out;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          color: #64748b;
        }

        .modal-banner {
          width: 100%;
          height: 350px;
          object-fit: cover;
        }

        .modal-body {
          padding: 40px;
        }

        .modal-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 24px;
        }

        .modal-article {
          color: #334155;
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .modal-article h4 {
          font-size: 1.4rem;
          margin-top: 30px;
          margin-bottom: 15px;
          color: #0f172a;
        }

        @media (max-width: 640px) {
          .blog-header h2 { font-size: 2.25rem; }
          .modal-body { padding: 24px; }
          .modal-banner { height: 200px; }
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

          <div style={{ maxWidth: '600px', margin: '0 auto 40px auto', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for tips (e.g. food, health, vaccines)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 24px 16px 50px',
                borderRadius: '50px',
                border: '1px solid #e2e8f0',
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <ArrowRight size={20} />
            </div>
          </div>

          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="blog-container">
            {filteredBlogs.map((blog, index) => (
              <div
                className="blog-card"
                key={index}
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="blog-image-wrapper">
                  <div className="blog-category-tag">{blog.category}</div>
                  <div className="blog-card-actions">
                    <button
                      className={`action-icon-btn ${likedBlogs[index] ? 'liked' : ''}`}
                      onClick={(e) => handleLike(e, index)}
                    >
                      <Heart size={18} fill={likedBlogs[index] ? "#ef4444" : "none"} />
                    </button>
                    <button className="action-icon-btn" onClick={(e) => handleSave(e)}>
                      <Bookmark size={18} />
                    </button>
                    <button className="action-icon-btn" onClick={(e) => handleShare(e, blog)}>
                      <Share2 size={18} />
                    </button>
                  </div>
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

        {selectedBlog && (
          <div className="blog-modal-overlay" onClick={() => setSelectedBlog(null)}>
            <div className="blog-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setSelectedBlog(null)}>
                <X size={24} />
              </button>

              <img src={selectedBlog.image} alt={selectedBlog.title} className="modal-banner" />

              <div className="modal-body">
                <div className="blog-meta" style={{ marginBottom: '16px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{selectedBlog.category}</span>
                  <span>•</span>
                  <span>{selectedBlog.date}</span>
                  <span>•</span>
                  <span>{selectedBlog.readTime}</span>
                </div>

                <h2 className="modal-title">{selectedBlog.title}</h2>

                <div
                  className="modal-article"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default BlogSection;
