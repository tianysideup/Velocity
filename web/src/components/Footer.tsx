import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/img/Logo.png" alt="Velocity" className="footer-logo" />
            <p>Premium rentals at your velocity</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#rentals">Rentals</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#rentals">Vehicle Rentals</a></li>
              <li><a href="#rentals">Equipment Rentals</a></li>
              <li><a href="#rentals">Space Rentals</a></li>
              <li><a href="#contact">Custom Solutions</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>091826565131</li>
              <li>velocity@gmail.com</li>
              <li>Olongapo City</li>
           
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Velocity. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;
