import React, { useState } from 'react'; // Import useState
import { FaShoppingCart } from 'react-icons/fa'; // Import the icon
import styles from './AnuncioPuntual.module.css';
import { useCart } from '../../hooks/useCart'; // Import useCart hook

const AnuncioPuntual = ({ imageUrl, slogan, precio, originalPrice, productData }) => { // Added originalPrice prop
  const { addItem } = useCart();
  const [addedMessage, setAddedMessage] = useState(''); // State for confirmation message

  const handleAddToCart = () => {
    if (productData) {
      addItem(productData, 1); // Add the product to the cart with quantity 1
      setAddedMessage('Agregado al carrito'); // Set message
      setTimeout(() => setAddedMessage(''), 3000); // Clear message after 3 seconds
    } else {
      console.error('No product data available to add to cart.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div className={styles.sloganContainer}>
          <p className={styles.slogan}>{slogan}</p>
        </div>
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={slogan} className={styles.image} />
        </div>
      </div>
      <div className={styles.bottomSection}>
        {originalPrice && originalPrice !== precio && ( // Conditionally render original price if different from discounted
          <p className={styles.originalPriceStrikethrough}>${originalPrice}</p>
        )}
        <p className={styles.precio}>${precio}</p>
        <button className={styles.addToCartButton} title="Agregar al carrito" onClick={handleAddToCart}>
          <FaShoppingCart />
        </button>
      </div>
      {addedMessage && <div className={styles.addedMessage}>{addedMessage}</div>} {/* Render message conditionally */}
    </div>
  );
};

export default AnuncioPuntual;
