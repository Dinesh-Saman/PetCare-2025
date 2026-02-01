// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaBars, FaTimes, FaPaw, FaHome, FaCalendarCheck, 
  FaInfoCircle, FaEnvelope, FaUserCircle 
} from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Check authentication status - PET OWNER ONLY
  useEffect(() => {
    const checkAuth = () => {
      // Owner check only
      const ownerData = localStorage.getItem('owner_user');
      if (ownerData) {
        try {
          const parsed = JSON.parse(ownerData);
          if (parsed?.id && (parsed.role === 'owner' || parsed.userType === 'PetOwner')) {
            setIsLoggedIn(true);
            // Show owner name
            const fullName = `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
            setUserName(fullName || 'Pet Owner');
            return;
          }
        } catch (err) {
          console.warn('Invalid owner_user data', err);
        }
      }

      // Not logged in
      setIsLoggedIn(false);
      setUserName('');
    };

    checkAuth();

    // Re-check when storage changes (login/logout in another tab)
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? "auto" : "hidden";
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleLogout = () => {
    // Clear all owner-related items
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_user');
    localStorage.removeItem('owner');
    localStorage.removeItem('token'); // Also clear general token if exists
    localStorage.removeItem('user'); // Also clear general user if exists
    
    setIsLoggedIn(false);
    setUserName('');
    closeMenu();
    navigate('/owner/login');
  };

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest(".menu-toggle")) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menu items - PET OWNER ONLY
  const commonItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/about", icon: <FaInfoCircle />, label: "About Us" },
    { path: "/contact", icon: <FaEnvelope />, label: "Contact Us" },
  ];

  const ownerItems = [
    { path: "/owner/my-appointments", icon: <FaCalendarCheck />, label: "My Appointments" },
  ];

  // Only show owner items when logged in as owner
  let menuItems = commonItems;
  if (isLoggedIn) menuItems = [...commonItems, ...ownerItems];

  // ────────────────────────────────────────────────
  // Render - PET OWNER ONLY NAVBAR
  // ────────────────────────────────────────────────
  return (
    <>
      <nav style={{
        background: 'linear-gradient(90deg, #004aad, #0077ff)',
        color: 'white',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        height: '80px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 30px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo - Goes to owner profile when logged in */}
          <Link
            to={isLoggedIn ? "/owner/profile" : "/"}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'white' }}
          >
            <FaPaw style={{ fontSize: '2.2rem' }} />
            <span style={{ fontWeight: 700, fontSize: '1.7rem' }}>Pawpal</span>
          </Link>

          {/* Desktop links - center */}
          <ul style={{
            listStyle: 'none',
            display: 'flex',
            gap: '45px',
            margin: 0,
            padding: 0,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }} className="navbar-links">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    padding: '8px 0',
                    position: 'relative',
                    transition: 'all 0.25s',
                  }}
                  className={isActive(item.path) ? 'active' : ''}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span style={{
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: 'white',
                      borderRadius: '2px',
                    }} />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side - Profile / Auth - PET OWNER ONLY */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {isLoggedIn ? (
              <>
                {/* Pet Owner Profile with Name */}
                <Link
                  to="/owner/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <FaUserCircle style={{ fontSize: '1.5rem' }} />
                  <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                    {userName || 'Profile'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Only show pet owner login */}
                <Link
                  to="/owner/login"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.25)',
                  }}
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="menu-toggle"
              onClick={toggleMenu}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                cursor: 'pointer',
              }}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            zIndex: 999,
          }}
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: 0,
          left: menuOpen ? 0 : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #004aad, #0077ff)',
          zIndex: 1000,
          transition: 'left 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 25px',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
            <FaPaw style={{ fontSize: '2.2rem' }} />
            <span style={{ fontSize: '1.7rem', fontWeight: 700 }}>Pawpal</span>
          </div>
          <button onClick={closeMenu} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2.2rem' }}>
            <FaTimes />
          </button>
        </div>

        {/* Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMenu}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '18px 30px',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    background: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth section in mobile - PET OWNER ONLY */}
          <div style={{ padding: '25px 30px', borderTop: '1px solid rgba(255,255,255,0.18)' }}>
            {isLoggedIn ? (
              <>
                {/* Pet Owner Info with Name */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '20px',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '1.15rem',
                }}>
                  Pet Owner
                  <br />
                  {userName && (
                    <small style={{ opacity: 0.8, fontSize: '0.95rem' }}>{userName}</small>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Only pet owner login */}
                <Link
                  to="/owner/login"
                  onClick={closeMenu}
                  style={{
                    padding: '14px',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  style={{
                    padding: '14px',
                    background: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.9rem',
          borderTop: '1px solid rgba(255,255,255,0.15)',
        }}>
          © {new Date().getFullYear()} Pawpal
        </div>
      </div>

      {/* Add CSS for responsive behavior */}
      <style>{`
        @media (max-width: 900px) {
          .navbar-links {
            display: none !important;
          }
          .menu-toggle {
            display: block !important;
          }
        }
        @media (min-width: 901px) {
          .menu-toggle {
            display: none !important;
          }
        }
        body {
          padding-top: 80px;
        }
      `}</style>
    </>
  );
};

export default Navbar;