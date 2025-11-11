import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './OringsSearchResults.module.css';
import StockStatus from './StockStatus';
import { calculateArrivalDate, formatToShortDate } from '../../../utils/dateUtils';
import { useCart } from '@/hooks/useCart';
import { FaAngleDoubleUp } from 'react-icons/fa';
import AvisoEscasez from '../../common/AvisoEscasez';
import MaterialFilterBar from './MaterialFilterBar';
import FichaTecnica from './FichaTecnica';

const OringsSearchResults = ({ results, selectedProfile }) => {
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState({});
  const [addedMessage, setAddedMessage] = useState({});
  const [isScarcityModalOpen, setIsScarcityModalOpen] = useState(false);
  const [scarcityMessage, setScarcityMessage] = useState('');
  const [showScroll, setShowScroll] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    if (results && results.length > 0) {
      const materialCounts = results.reduce((acc, product) => {
        if (product.material) {
          acc[product.material] = (acc[product.material] || 0) + 1;
        }
        return acc;
      }, {});

      let mostCommonMaterial = null;
      let maxCount = 0;
      for (const material in materialCounts) {
        if (materialCounts[material] > maxCount) {
          maxCount = materialCounts[material];
          mostCommonMaterial = material;
        }
      }
      setSelectedMaterial(mostCommonMaterial);
    }
  }, [results]);

  const availableMaterials = useMemo(() => {
    if (!results) return [];
    const materials = results.map(p => p.material).filter(Boolean);
    return [...new Set(materials)].sort();
  }, [results]);

  const handleMaterialChange = (material) => {
    setSelectedMaterial(prev => (prev === material ? null : material));
  };

  const filteredResults = useMemo(() => {
    if (!selectedMaterial) {
      return results;
    }
    return results.filter(p => p.material === selectedMaterial);
  }, [results, selectedMaterial]);

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
      return;
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
      <FichaTecnica selectedMaterial={selectedMaterial} selectedProfile={selectedProfile} />
      <MaterialFilterBar
        availableMaterials={availableMaterials}
        materialFilters={selectedMaterial ? [selectedMaterial] : []}
        onMaterialChange={handleMaterialChange}
      />
      {filteredResults.length > 0 ? (
        <table className={`${styles.resultsTable} fade-in`}>
          <thead>
            <tr>
              <th style={{width: '10%'}}>Perfil</th>
              <th style={{width: '13%'}}>Clave</th>
              <th style={{width: '7%'}}>DI</th>
              <th style={{width: '7%'}}>DE</th>
              <th style={{width: '7%'}}>Sección</th>
              <th>Precio</th>
              <th style={{width: '10%'}}>Unidad</th>
              <th style={{width: '12%'}}>Cant por empaque</th>
              <th>Agregar al carrito</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((product) => {
             const needsStockStatus = (product.precio == 0 || product.existencia == 0) && product.ultima_compra;
              const arrivalDate = needsStockStatus ? formatToShortDate(calculateArrivalDate()) : null;

              return (
                <tr style={{borderBottom: "1px solid #ddd"}} key={product.clave}>
                  <td>
                    <Link to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.linea}.jpg`)}`}>
                      <img
                        src={`/Perfiles/${product.linea}.jpg`}
                        alt={product.descripcion}
                        className={styles.productImage}
                      />
                    </Link>
                  </td>
                  <td>
                    <Link style={{textDecoration:"underline", color: "#212c59"}} to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(`/Perfiles/${product.linea}.jpg`)}`}>
                    {product.clave}
                    </Link>
                  </td>
                  <td style={{fontWeight:500}}>{product.diam_int}</td>
                  <td style={{fontWeight:500}}>{product.diam_ext}</td>
                  <td style={{fontWeight:500}}>{product.seccion}</td>
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
                      disabled={product.existencia === 0}
                    />
                    <button
                      onClick={() => handleAddToCart(product)}
                       className="sm-btn sm-btn-primary"
                       style={{padding:"7px 20px", fontSize:"0.9em", transition: "background-color 0.2s"}}
                       disabled={product.existencia === 0}
                    >
                      Agregar
                    </button>
                    {addedMessage[product.clave] && <div className={styles.addedMessage}>{addedMessage[product.clave]}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{padding: "40px", textAlign: "center"}}>
            <p>No se encontraron productos con el material seleccionado.</p>
        </div>
      )}
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

export default OringsSearchResults;
