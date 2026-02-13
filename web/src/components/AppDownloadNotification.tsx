import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/AppDownloadNotification.css';

const AppDownloadNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Always show notification after 10 seconds, regardless of previous dismissal
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 100);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // const handleDownload = (platform: string) => {
  //   console.log(`Download for ${platform} clicked`);
  //   // Add your download logic here
  //   handleDismiss();
  // };

  if (!isVisible) return null;

  return (
    <div className={`app-notification ${isAnimating ? 'show' : ''}`}>
      <button className="notification-close" onClick={handleDismiss} aria-label="Close notification">
        <FaTimes />
      </button>
      
      <div className="notification-content">
        <div className="notification-icon">
          <img src="/img/app-logo.png" alt="Velocity App" />
        </div>
        
        <div className="notification-text">
          <h4>Get Our Mobile App</h4>
          <p>Access Velocity on the go! Download our app for a seamless rental experience.</p>
        </div>
        
   
      </div>
    </div>
  );
};

export default AppDownloadNotification;
