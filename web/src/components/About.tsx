import { FaCheck, FaBolt, FaGem, FaShieldAlt } from 'react-icons/fa';
import '../styles/About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-content">
          <h2 className="section-title">About Velocity</h2>
          <div className="about-text">
            <p>
              Founded with a vision to revolutionize the rental industry, Velocity brings 
              together quality, convenience, and exceptional service. Our commitment is to 
              provide seamless rental experiences that move at your pace.
            </p>
         
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FaCheck /></div>
              <h3>Verified Quality</h3>
              <p>Every item thoroughly inspected and maintained to the highest standards</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FaBolt /></div>
              <h3>Quick Process</h3>
              <p>Streamlined booking and delivery for your convenience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FaGem /></div>
              <h3>Premium Selection</h3>
              <p>Curated inventory of top-tier rental options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FaShieldAlt /></div>
              <h3>Full Support</h3>
              <p>Dedicated team ready to assist you anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
