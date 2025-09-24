import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ProductOffer.module.css';

const ProductOffer = ({ product }) => {
  const queryClient = useQueryClient();
  const allProducts = queryClient.getQueryData(['products']);
  const promotionalProducts = queryClient.getQueryData(['promotionalProducts']);

  const [messageIndex, setMessageIndex] = useState(0); // Unconditional hook call

  // Initialize values
  let normalPrice = 0;
  let offerPrice = 0;
  let promoDetails = null;
  let originalProduct = null;
  let messages = [" "]; // Default empty message to avoid issues with messages.length

  // Perform calculations conditionally
  if (product && allProducts && promotionalProducts) {
    promoDetails = promotionalProducts.find(promo => promo.clave === product.clave);

    if (promoDetails) {
      originalProduct = allProducts.find(p => p.clave === product.clave);

      if (originalProduct) {
        normalPrice = parseFloat(originalProduct.precio);
        const discount = parseFloat(promoDetails.descuento);

        offerPrice = normalPrice;
        if (!isNaN(discount) && discount > 0 && discount <= 100) {
          offerPrice = normalPrice * (1 - discount / 100);
        }

        messages = [
          "En Oferta",
          <span key="normalPrice" className={styles.normalPrice}>${normalPrice.toFixed(2)}</span>
        ];
      }
    }
  }

  useEffect(() => { // Unconditional hook call
    if (messages.length > 0 && messages[0] !== " ") { // Only set interval if there are actual messages
      const interval = setInterval(() => {
        setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
      }, 1500);

      return () => clearInterval(interval);
    }
    return undefined; // No cleanup needed if no interval was set
  }, [messages.length, normalPrice, messages]); // Dependencies

  // Conditional rendering based on whether promoDetails and originalProduct were found
  if (!promoDetails || !originalProduct) {
    return null;
  }

  return (
    <div className={styles.offerContainer}>
      <div className={styles.topSection}>
        <span key={messageIndex} className={styles.animatedText}>
          {messages[messageIndex]}
        </span>
      </div>
      <div className={styles.bottomSection}>
        <span className={styles.offerPrice}>${offerPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ProductOffer;