import {
  FaCar,
  FaChevronRight,
  FaRobot,
  FaStar,
  FaTools,
  FaLongArrowAltRight
} from 'react-icons/fa';
import '../styles/Hero.css';

const Hero = () => {
  const scrollToRentals = () => {
    const element = document.getElementById('rentals');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badges">
            <div className="hero-badge">
              <span className="hero-badge-icon" aria-hidden="true">
                <FaStar />
              </span>
              <span className="hero-badge-text">Trusted by 200+ renters</span>
            </div>
            <div className="hero-badge">
              <span className="hero-badge-icon" aria-hidden="true">
                <FaRobot />
              </span>
              <span className="hero-badge-text">Fast booking, flexible rentals</span>
              <span className="hero-badge-arrow" aria-hidden="true">
                <FaChevronRight />
              </span>
            </div>
          </div>
          <h1 className="hero-title">
            Premium Rentals at
            <span className="highlight"> Your Velocity</span>
          </h1>
          <p className="hero-subtitle">
            Experience quality and reliability with our curated selection of rental services.
            Fast, efficient, and tailored to your needs.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={scrollToRentals}>
              Browse Rentals
              <span className="btn-icon" aria-hidden="true">
                <FaLongArrowAltRight />
              </span>
            </button>
            <button className="btn btn-secondary" onClick={scrollToContact}>
              Get in Touch
              <span className="btn-icon" aria-hidden="true">
                <FaChevronRight />
              </span>
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Happy Clients</p>
            </div>
            <div className="stat">
              <h3>1000+</h3>
              <p>Successful Rentals</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>

        <div className="hero-phone">
          <div className="floating-element floating-1" aria-hidden="true">
            <span className="floating-icon" aria-hidden="true">
              <FaCar />
            </span>
            <span className="floating-text" aria-hidden="true">
              <span className="floating-title">Instant booking</span>
              <span className="floating-subtitle">Fast confirmation</span>
            </span>
          </div>
          <div className="floating-element floating-2" aria-hidden="true">
            <span className="floating-icon" aria-hidden="true">
              <FaTools />
            </span>
            <span className="floating-text" aria-hidden="true">
              <span className="floating-title">Quality checked</span>
              <span className="floating-subtitle">Ready to rent</span>
            </span>
          </div>
          <img
            src="/img/hero.png"
            alt="Velocity rentals preview"
            className="hero-image"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
