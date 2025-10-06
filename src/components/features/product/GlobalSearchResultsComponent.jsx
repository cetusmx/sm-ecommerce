import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchResults.module.css';
import StockStatus from './StockStatus';
import { calculateArrivalDate, formatToShortDate } from '../../../utils/dateUtils';
import { useCart } from '@/hooks/useCart'; // Import useCart
import AvisoEscasez from '../../common/AvisoEscasez';

const GlobalSearchResultsComponent = ({ results, searchQuery }) => {
  const { addItem } = useCart(); // Get addItem from cart context
  const [quantities, setQuantities] = useState({}); // State for quantities
  const [addedMessage, setAddedMessage] = useState({}); // State for added message
  const [isScarcityModalOpen, setIsScarcityModalOpen] = useState(false);
  const [scarcityMessage, setScarcityMessage] = useState('');

  // Products are already filtered by existence/ultima_compra in HomePage.jsx
  const filteredForDisplay = results;

  const handleQuantityChange = (product, value) => {
    const newQuantity = Math.max(0, Number(value));
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [product.clave]: newQuantity
    }));

    if (newQuantity > product.existencia) {
      setScarcityMessage(`La cantidad solicitada (${newQuantity}) excede la existencia (${product.existencia}).`);
      setIsScarcityModalOpen(true);
    } else {
      setIsScarcityModalOpen(false);
      setScarcityMessage('');
    }
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.clave] || 1;

    if (quantity > product.existencia) {
      setScarcityMessage(`La cantidad solicitada (${quantity}) excede la existencia (${product.existencia}).`);
      setIsScarcityModalOpen(true);
      return; // Prevent adding to cart if quantity exceeds stock
    }

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
            <th style={{width: '13%'}}>SKU</th>
            <th style={{width: '9%'}}>DI</th>
            <th style={{width: '9%'}}>DE</th>
            <th style={{width: '9%'}}>Altura</th>
            <th>Precio</th>
            <th style={{width: '10%'}}>Unidad</th>
            <th style={{width: '12%'}}>Cant por empaque</th>
            <th>Agregar al carrito</th>
          </tr>
        </thead>
        <tbody>
          {filteredForDisplay.map((product) => {
            const needsStockStatus = (product.precio == 0 || product.existencia == 0) && product.ultima_compra;
            const arrivalDate = needsStockStatus ? formatToShortDate(calculateArrivalDate()) : null;

            return (
              <tr key={product.clave}>
                <td>
                  <Link to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.linea}.jpg`)}`}> 
                    <img 
                      src={`/Perfiles/${product.linea}.jpg`} 
                      alt={product.descripcion} 
                      className={styles.productImage} 
                    />
                  </Link>
                </td>
                <td>{product.clave}</td>
                <td style={{fontWeight:500}}>{product.diam_int}</td>
                <td style={{fontWeight:500}}>{product.diam_ext}</td>
                <td style={{fontWeight:500}}>{product.altura}</td>
                <td>
                  {needsStockStatus ? (
                    <StockStatus arrivalDate={arrivalDate} />
                  ) : (
                    formatCurrency(product.precio)
                  )}
                </td>
                <td>{product.unidad}</td>
                <td>{product.cant_por_empaque}</td>
                <td className={styles.actionsCell}>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantities[product.clave] || 1} 
                    onChange={(e) => handleQuantityChange(product, e.target.value)}
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
            );
          })}
        </tbody>
      </table>
      <AvisoEscasez
        isOpen={isScarcityModalOpen}
        onClose={() => setIsScarcityModalOpen(false)}
        message={scarcityMessage}
      />
    </div>
  );
};

export default GlobalSearchResultsComponent;
