import React, { useState, useEffect } from 'react';
import './SplashScreen.css';
import KaSiLogo1 from '../assets/images/KaSiLogo-1.png';
import KaSiLogo2 from '../assets/images/KaSiLogo-2.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentLogo, setCurrentLogo] = useState(2); // Start with KaSiLogo-2
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // After 1.5 seconds, start transition to white background and switch to logo 1
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true);
      setCurrentLogo(1);
    }, 1500);

    // After 3 seconds total, complete the splash screen
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="logo-container">
        <img
          src={currentLogo === 1 ? KaSiLogo1 : KaSiLogo2}
          alt="KaSi Logo"
          className="splash-logo"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
