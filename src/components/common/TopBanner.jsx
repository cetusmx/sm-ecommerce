import React, { useState, useEffect } from 'react';
import styles from './TopBanner.module.css';

const messages = [
  "*** Paga con tarjeta o transferencia ***",
  "--> Envío gratis por tiempo limitado <--"
];

const TopBanner = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false); // Start fade out

      const timeout = setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsVisible(true); // Start fade in
      }, 500); // Duration of fade out animation

      return () => clearTimeout(timeout);
    }, 5000); // Change message every 5 seconds (including animation time)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.topBanner}>
      <div className={`${styles.messageContainer} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
        <p className={styles.messageText}>{messages[currentMessageIndex]}</p>
      </div>
    </div>
  );
};

export default TopBanner;
