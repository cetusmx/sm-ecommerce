import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchResults.module.css';
import StockStatus from './StockStatus';
import { calculateArrivalDate, formatToShortDate } from '../../../utils/dateUtils';

const SearchResults = ({ results, searchUpdateId, selectedCategory }) => {
  if (results.length === 0) {
    return null;
  }

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
          {results.map((product) => {
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
                    `${product.precio}`
                  )}
                </td>
                <td>{product.unidad}</td>
                <td>{product.cant_por_empaque}</td>
                <td className={styles.actionsCell}>
                  <input type="number" min="1" defaultValue="1" className={styles.quantityInput} />
                  <button className={styles.addToCartButton}>Agregar al carrito</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResults;