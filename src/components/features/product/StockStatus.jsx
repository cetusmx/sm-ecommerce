import React, { useState, useEffect } from 'react';
import styles from './StockStatus.module.css';

const messages = ["Sin stock", "Llega el"];

const StockStatus = ({ arrivalDate }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.statusContainer}>
      <div className={styles.topSection}>
        <span key={messageIndex} className={styles.animatedText}>
          {messages[messageIndex]}
        </span>
      </div>
      <div className={styles.bottomSection}>
        {arrivalDate}
      </div>
    </div>
  );
};

export default StockStatus;
