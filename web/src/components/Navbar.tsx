import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserRentals } from '../services/rentalService';
import '../styles/Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rentalCount, setRentalCount] = useState(0);
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserRentals(currentUser.uid, (rentals) => {
        const activeCount = rentals.filter(
          r => r.status === 'pending' || r.status === 'active'
        ).length;
        setRentalCount(activeCount);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const scrollToSection = (id: string) => {
    // Navigate to home page first if not already there
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/img/Logo.png" alt="Velocity" />
        </Link>

        <button 
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><a onClick={() => scrollToSection('home')}>Home</a></li>
          <li><a onClick={() => scrollToSection('about')}>About</a></li>
          <li><Link to="/rentals" onClick={() => setMenuOpen(false)}>Rentals</Link></li>
          <li><a onClick={() => scrollToSection('testimonials')}>Testimonials</a></li>
          <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
          
          {currentUser && (
            <li className="mobile-cart-item">
              <Link to="/notifications" className="mobile-cart-link" onClick={() => setMenuOpen(false)}>
                <FaShoppingCart /> My Rentals
                {rentalCount > 0 && (
                  <span className="mobile-cart-badge">{rentalCount}</span>
                )}
              </Link>
            </li>
          )}
          
          <li className="mobile-auth">
            {currentUser ? (
              <div className="mobile-profile">
                <span className="mobile-user-email">{currentUser.email}</span>
                <button onClick={handleLogout} className="mobile-logout-btn">Logout</button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="auth-btn login-btn" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="auth-btn register-btn" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </li>
        </ul>

        <div className="nav-auth">
          {currentUser ? (
            <>
              <Link to="/notifications" className="cart-icon">
                <FaShoppingCart />
                {rentalCount > 0 && (
                  <span className="cart-badge">{rentalCount}</span>
                )}
              </Link>
              <div className="profile-dropdown-container">
              <button 
                className="profile-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="profile-avatar">
                  <span className="avatar-text">
                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{userProfile?.name || 'User'}</span>
                  <span className="profile-email">{currentUser.email}</span>
                </div>
                <FaChevronDown className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="auth-btn register-btn" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
