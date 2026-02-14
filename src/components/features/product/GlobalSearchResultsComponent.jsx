import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchResults.module.css';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { FaAngleDoubleUp } from 'react-icons/fa';

const GlobalSearchResultsComponent = ({ results, searchQuery }) => {
  const { addItem } = useCart(); // Get addItem from cart context
  const [quantities, setQuantities] = useState({}); // State for quantities
  const [addedMessage, setAddedMessage] = useState({}); // State for added message
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [showScroll]);

  // New Rule: Filter out products that have ultima_compra but price is 0
  const filteredForDisplay = results.filter(product => {
    if (product.ultima_compra && product.precio == 0) {
      return false;
    }
    return true;
  });

  const scrollTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleQuantityChange = (clave, value) => {
    const newQuantity = Math.max(0, Number(value));
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [clave]: newQuantity
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.clave] || 1;
    // Removed validation against product.existencia

    addItem(product, parseInt(quantity));
    setAddedMessage(prevMessages => ({
      ...prevMessages,
      [product.clave]: 'Agregado al carrito'
    }));
    setTimeout(() => {
      setAddedMessage(prevMessages => ({
        ...prevMessages,
        [product.clave]: ''
      }));
    }, 3000);
  };

  if (results.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <h2 className={styles.title}>Resultados de la búsqueda</h2>
        <p>No se encontraron productos para "{searchQuery}".</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  if (filteredForDisplay.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <h2 className={styles.title}>Resultados de la búsqueda</h2>
        <p>No se encontraron productos para "{searchQuery}".</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Resultados de la búsqueda para "{searchQuery}"</h2>
      </div>
      <table className={`${styles.resultsTable} fade-in`}>
        <thead>
          <tr>
            <th style={{width: '10%'}}>Vista</th>
            <th style={{width: '13%'}}>Clave</th>
            <th style={{width: '7%'}}>DI</th>
            <th style={{width: '7%'}}>DE</th>
            <th style={{width: '7%'}}>Altura</th>
            <th style={{width: '8%'}}>Marca</th>
            <th>Precio</th>
            <th style={{width: '10%'}}>Unidad</th>
            <th style={{width: '12%'}}>Cant por empaque</th>
            <th>Agregar al carrito</th>
          </tr>
        </thead>
        <tbody>
          {filteredForDisplay.map((product) => (
            <tr key={product.clave}>
              <td>
                <Link to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.perfil}.png`)}`}>
                  <img 
                    src={`/Perfiles/${product.perfil}.png`} 
                    alt={product.descripcion} 
                    className={styles.productImage} 
                  />
                </Link>
              </td>
              <td>
                <Link style={{textDecoration:"underline", color: "#212c59"}} to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.perfil}.png`)}`}>
                {product.clave}
                </Link>
                </td>
              <td style={{fontWeight:500}}>{product.diam_int}</td>
              <td style={{fontWeight:500}}>{product.diam_ext}</td>
              <td style={{fontWeight:500}}>{product.altura}</td>
              <td style={{fontWeight:500}}>{product.marca}</td>
              <td>
                {formatCurrency(product.precio)}
              </td>
              <td>{product.unidad}</td>
              <td>{product.cant_por_empaque}</td>
              <td className={styles.actionsCell}>
                <input 
                  type="number" 
                  min="1" 
                  value={quantities[product.clave] || 1} 
                  onChange={(e) => handleQuantityChange(product.clave, e.target.value)}
                  className={styles.quantityInput} 
                />
                <button 
                  onClick={() => handleAddToCart(product)}
                  style={{padding:"8px 12px", fontSize:"0.8rem", transition: "background-color 0.2s"}}
                  className='sm-btn sm-btn-primary'
                >
                  Agregar al carrito
                </button>
                {addedMessage[product.clave] && <div className={styles.addedMessage}>{addedMessage[product.clave]}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showScroll && (
        <button onClick={scrollTop} className={styles.scrollTopButton}>
          <FaAngleDoubleUp />
        </button>
      )}
    </div>
  );
};

export default GlobalSearchResultsComponent;