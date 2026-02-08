import { useState, useEffect } from 'react';
import { FaTimes, FaApple, FaGooglePlay } from 'react-icons/fa';
import '../styles/AppDownloadNotification.css';

const AppDownloadNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the notification
    const isDismissed = localStorage.getItem('appNotificationDismissed');
    
    if (!isDismissed) {
      // Show notification after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 100);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('appNotificationDismissed', 'true');
    }, 300);
  };

  const handleDownload = (platform: string) => {
    console.log(`Download for ${platform} clicked`);
    // Add your download logic here
    handleDismiss();
  };

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
        
        <div className="notification-actions">
          <button 
            className="download-btn ios-btn" 
            onClick={() => handleDownload('iOS')}
            aria-label="Download on App Store"
          >
            <FaApple />
            <span>App Store</span>
          </button>
          <button 
            className="download-btn android-btn" 
            onClick={() => handleDownload('Android')}
            aria-label="Download on Google Play"
          >
            <FaGooglePlay />
            <span>Google Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadNotification;
