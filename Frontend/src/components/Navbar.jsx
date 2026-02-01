// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaPaw, FaHome, FaCalendarCheck, FaInfoCircle, FaEnvelope, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Check login status on mount and route changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('owner');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.id || parsed._id) {
            setIsLoggedIn(true);
            return;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setIsLoggedIn(false);
    };

    checkLoginStatus();

    const handleStorageChange = () => checkLoginStatus();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
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
    localStorage.removeItem('owner');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    closeMenu();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".menu-toggle")
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, []);

  // Common menu items (visible to everyone)
  const commonMenuItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/about", icon: <FaInfoCircle />, label: "About Us" },
    { path: "/contact", icon: <FaEnvelope />, label: "Contact Us" },
  ];

  // Menu items only for logged-in users
  const loggedInMenuItems = [
    { path: "/owner/my-appointments", icon: <FaCalendarCheck />, label: "My Appointments" },
    // "Book Appointment" was removed here
  ];

  const menuItems = isLoggedIn
    ? [...commonMenuItems, ...loggedInMenuItems]
    : commonMenuItems;

  // ────────────────────────────────────────────────
  //                  INLINE STYLES
  // ────────────────────────────────────────────────
  const styles = {
    navbar: {
      background: 'linear-gradient(90deg, #004aad, #0077ff)',
      color: 'white',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
      fontFamily: "'Segoe UI', sans-serif",
    },
    navbarContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 30px',
      height: '80px',
    },
    navbarLogo: {
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
    },
    navbarLogoLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      color: 'white',
    },
    logoIcon: { fontSize: '2rem' },
    logoText: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.5px' },

    navbarLinks: {
      listStyle: 'none',
      display: 'flex',
      gap: '35px',
      margin: 0,
      padding: 0,
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    navbarLink: {
      textDecoration: 'none',
      color: 'white',
      fontWeight: 500,
      fontSize: '1rem',
      transition: 'color 0.3s, transform 0.2s',
      padding: '8px 0',
      position: 'relative',
      display: 'block',
    },
    navbarLinkHover: { color: '#e1eaff', transform: 'translateY(-2px)' },
    activeLinkAfter: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '2px',
      background: '#ffffff',
      borderRadius: '2px',
    },

    navbarRight: {
      flex: '0 0 auto',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '15px',
    },
    profileSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    profileLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      fontWeight: 500,
    },
    profileLinkHover: {
      background: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    profileIcon: { fontSize: '1.3rem' },
    profileText: { fontWeight: 600, fontSize: '1rem' },

    logoutBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      border: '2px solid transparent',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
    },

    loginBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      border: '2px solid transparent',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      textDecoration: 'none',
      display: 'inline-block',
    },
    registerBtn: {
      background: 'rgba(255, 255, 255, 0.25)',
      color: 'white',
      border: '2px solid transparent',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      textDecoration: 'none',
      display: 'inline-block',
    },
    buttonHover: {
      background: 'rgba(255, 255, 255, 0.25)',
      transform: 'translateY(-2px)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    menuToggle: {
      display: 'none',
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '1.8rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      width: '50px',
      height: '50px',
      zIndex: 1002,
    },
    menuToggleHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#cce0ff',
      transform: 'scale(1.05)',
    },

    // ─── Mobile Menu Styles ─────────────────────────────────────
    mobileMenuOverlay: {
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 999,
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.3s ease',
    },
    mobileMenuOverlayActive: { opacity: 1, visibility: 'visible' },

    mobileMenu: {
      position: 'fixed',
      top: 0, left: '-100%',
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #004aad 0%, #0077ff 100%)',
      zIndex: 1000,
      transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    mobileMenuActive: { left: 0 },

    mobileMenuHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '25px 25px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.15)',
      minHeight: '80px',
    },

    mobileMenuContent: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
    },

    mobileMenuLinks: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 30px 0',
    },

    mobileMenuItem: {
      margin: '5px 20px',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
    },
    mobileMenuItemHover: { transform: 'translateX(5px)' },

    mobileMenuLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '22px 25px',
      textDecoration: 'none',
      color: 'white',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
    },
    mobileMenuLinkHover: { background: 'rgba(255, 255, 255, 0.1)' },
    mobileMenuLinkActive: {
      background: 'rgba(255, 255, 255, 0.15)',
      borderLeft: '5px solid #ffffff',
    },

    mobileMenuIcon: {
      fontSize: '1.4rem',
      width: '30px',
      textAlign: 'center',
      color: '#cce0ff',
    },
    mobileMenuLabel: { fontSize: '1.1rem', fontWeight: 500, flex: 1 },

    mobileMenuActiveIndicator: {
      width: '10px',
      height: '10px',
      background: 'white',
      borderRadius: '50%',
      animation: 'blink 1.5s infinite',
    },

    mobileProfileSection: {
      margin: '20px',
      padding: '25px',
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },

    mobileProfileLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      textDecoration: 'none',
      color: 'white',
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      border: '2px solid rgba(255, 255, 255, 0.2)',
    },
    mobileProfileLinkHover: {
      background: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    mobileLogoutBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      border: '2px solid transparent',
      padding: '15px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },

    mobileLoginBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      border: '2px solid transparent',
      padding: '15px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },
    mobileRegisterBtn: {
      background: 'rgba(255, 255, 255, 0.25)',
      color: 'white',
      border: '2px solid transparent',
      padding: '15px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },

    mobileMenuFooter: {
      marginTop: 'auto',
      padding: '25px',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.15)',
    },
    mobileMenuCopyright: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.8rem',
      textAlign: 'center',
      lineHeight: '1.5',
    },
  };

  // Add global styles & animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      body { padding-top: 80px; }

      @media (max-width: 900px) {
        .navbar-links, .profile-section { display: none !important; }
        .menu-toggle { display: flex !important; }
      }
      @media (min-width: 901px) {
        .menu-toggle { display: none !important; }
        .mobile-menu, .mobile-menu-overlay { display: none !important; }
      }

      .mobile-menu-content::-webkit-scrollbar {
        width: 6px;
      }
      .mobile-menu-content::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
      }
      .mobile-menu-content::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 3px;
      }
      .mobile-menu-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.5);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navbarContainer}>
          {/* Logo */}
          <div style={styles.navbarLogo}>
            <Link
              to={isLoggedIn ? "/owner/profile" : "/"}
              onClick={closeMenu}
              style={styles.navbarLogoLink}
            >
              <FaPaw style={styles.logoIcon} />
              <span style={styles.logoText}>Pawpal</span>
            </Link>
          </div>

          {/* Desktop Links - Center */}
          <ul className="navbar-links" style={styles.navbarLinks}>
            {menuItems.map((item) => (
              <li
                key={item.path}
                style={styles.navbarLinkItem}
                className={isActive(item.path) ? "active" : ""}
              >
                <Link
                  to={item.path}
                  style={styles.navbarLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = styles.navbarLinkHover.color;
                    e.currentTarget.style.transform = styles.navbarLinkHover.transform;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.color = styles.navbarLink.color;
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  {item.label}
                  {isActive(item.path) && <span style={styles.activeLinkAfter} />}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side - Auth/Profile + Mobile toggle */}
          <div style={styles.navbarRight}>
            <div className="profile-section" style={styles.profileSection}>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/owner/profile"
                    style={styles.profileLink}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.profileLinkHover)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = styles.profileLink.background;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = styles.profileLink.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <FaUserCircle style={styles.profileIcon} />
                    <span style={styles.profileText}>Profile</span>
                  </Link>
                  <button
                    style={styles.logoutBtn}
                    onClick={handleLogout}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = styles.logoutBtn.background;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={styles.loginBtn}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = styles.loginBtn.background;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    style={styles.registerBtn}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = styles.registerBtn.background;
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              className="menu-toggle"
              style={styles.menuToggle}
              onClick={toggleMenu}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.menuToggleHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'none';
              }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className="mobile-menu-overlay"
        style={{
          ...styles.mobileMenuOverlay,
          ...(menuOpen ? styles.mobileMenuOverlayActive : {})
        }}
        onClick={closeMenu}
      />

      {/* Mobile full-screen menu */}
      <div
        ref={menuRef}
        className="mobile-menu"
        style={{
          ...styles.mobileMenu,
          ...(menuOpen ? styles.mobileMenuActive : {})
        }}
      >
        <div style={styles.mobileMenuHeader}>
          <div style={styles.mobileMenuLogo}>
            <FaPaw style={styles.mobileLogoIcon} />
            <span style={styles.mobileLogoText}>Pawpal</span>
          </div>
          <button
            style={styles.mobileMenuClose}
            onClick={closeMenu}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.mobileMenuCloseHover)}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = styles.mobileMenuClose.background;
              e.currentTarget.style.transform = 'none';
            }}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div style={styles.mobileMenuContent}>
          <ul style={styles.mobileMenuLinks}>
            {menuItems.map((item) => (
              <li
                key={item.path}
                style={styles.mobileMenuItem}
                className={isActive(item.path) ? "active" : ""}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = styles.mobileMenuItemHover.transform;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Link
                  to={item.path}
                  onClick={closeMenu}
                  style={styles.mobileMenuLink}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.background = styles.mobileMenuLinkHover.background;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.background = styles.mobileMenuLink.background;
                    }
                  }}
                >
                  <span style={styles.mobileMenuIcon}>{item.icon}</span>
                  <span style={styles.mobileMenuLabel}>{item.label}</span>
                  {isActive(item.path) && <span style={styles.mobileMenuActiveIndicator} />}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile auth/profile section */}
          <div style={styles.mobileProfileSection}>
            {isLoggedIn ? (
              <>
                <Link
                  to="/owner/profile"
                  style={styles.mobileProfileLink}
                  onClick={closeMenu}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.mobileProfileLinkHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = styles.mobileProfileLink.background;
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = styles.mobileProfileLink.border;
                  }}
                >
                  <FaUserCircle style={styles.mobileProfileIcon} />
                  <span>Profile</span>
                </Link>
                <button
                  style={styles.mobileLogoutBtn}
                  onClick={handleLogout}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = styles.mobileLogoutBtn.background;
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={styles.mobileLoginBtn}
                  onClick={closeMenu}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = styles.mobileLoginBtn.background;
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={styles.mobileRegisterBtn}
                  onClick={closeMenu}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = styles.mobileRegisterBtn.background;
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div style={styles.mobileMenuFooter}>
            <div style={styles.mobileMenuCopyright}>
              © {new Date().getFullYear()} Pawpal. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;