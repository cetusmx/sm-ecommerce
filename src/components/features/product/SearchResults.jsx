import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchResults.module.css';
import StockStatus from './StockStatus';
import { calculateArrivalDate, formatToShortDate } from '../../../utils/dateUtils';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { FaAngleDoubleUp } from 'react-icons/fa';
import AvisoEscasez from '../../common/AvisoEscasez';

const SearchResults = ({ results, searchUpdateId, selectedCategory }) => {
  const { addItem } = useCart(); // Get addItem from cart context
  const [quantities, setQuantities] = useState({}); // State for quantities
  const [addedMessage, setAddedMessage] = useState({}); // State for added message
  const [isScarcityModalOpen, setIsScarcityModalOpen] = useState(false);
  const [scarcityMessage, setScarcityMessage] = useState('');
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

  const scrollTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

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
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Resultados de la búsqueda</h2>
        {selectedCategory !== 'Orings' && (
          <p className={styles.searchNote}>
            Se incluyen productos con medidas muy cercanas a los parámetros de tu búsqueda, asegúrate de que las medidas cumplan con tus requerimientos
          </p>
        )}
      </div>
      <table key={searchUpdateId} className={`${styles.resultsTable} fade-in`}>
        <thead>
          <tr>
            <th style={{width: '10%'}}>Perfil</th>
            <th style={{width: '13%'}}>SKU</th>
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
          {results.map((product) => {
            const needsStockStatus = (product.precio == 0 || product.existencia == 0) && product.ultima_compra;
            const arrivalDate = needsStockStatus ? formatToShortDate(calculateArrivalDate()) : null;

            return (
              <tr style={{borderBottom: "1px solid #ddd"}} key={product.clave}>
                <td >
                  <Link to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.linea}.jpg`)}`}> 
                    <img 
                      src={`/Perfiles/${product.linea}.jpg`} 
                      alt={product.descripcion} 
                      className={styles.productImage} 
                    />
                    {/* <p style={{textDecoration: "underline", fontSize: "0.8em"}}>Ver detalles</p> */}
                  </Link>
                </td>
                <td>
                  <Link style={{textDecoration:"underline", color: "#212c59"}} to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.linea}.jpg`)}`}>
                  {product.clave}
                  </Link>
                </td>
                <td style={{fontWeight:500}}>{product.diam_int}</td>
                <td style={{fontWeight:500}}>{product.diam_ext}</td>
                <td style={{fontWeight:500}}>{product.altura}</td>
                <td style={{fontWeight:500}}>{product.marca}</td>
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
                     className="sm-btn sm-btn-primary"
                     style={{padding:"8px 12px", fontSize:"0.8rem", transition: "background-color 0.2s"}}
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
      {showScroll && (
        <button onClick={scrollTop} className={styles.scrollTopButton}>
          <FaAngleDoubleUp />
        </button>
      )}
    </div>
  );
};

export default SearchResults;