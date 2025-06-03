import React, { useEffect, useState } from 'react';
import './ScrollToTopButton.css';

const ScrollToTopButton = ({ scrollThreshold = 50 }) => { // 'scrollThreshold' determines when button appears
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > scrollThreshold); // Show button after scrolling down beyond threshold
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scrolling 
    });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? 'show' : ''}`} // Add 'show' class when isVisible is true
      onClick={scrollToTop}
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
