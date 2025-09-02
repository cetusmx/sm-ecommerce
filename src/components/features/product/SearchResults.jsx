import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchResults.module.css';

const SearchResults = ({ results }) => {
  if (results.length === 0) {
    return <p style={{ padding: '20px' }}>No se encontraron productos que coincidan con la búsqueda.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Resultados de la búsqueda</h2>
      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th style={{width: '10%'}}>Vista</th>
            <th style={{width: '10%'}}>SKU</th>
            <th style={{width: '10%'}}>DI</th>
            <th style={{width: '10%'}}>DE</th>
            <th style={{width: '10%'}}>Altura</th>
            <th>Precio</th>
            <th style={{width: '10%'}}>Unidad</th>
            <th style={{width: '12%'}}>Cant por empaque</th>
            <th>Agregar al carrito</th>
          </tr>
        </thead>
        <tbody>
          {results.map((product) => (
            <tr key={product.clave}>
              <td>
                <Link to={`/producto/${product.clave}`}>
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
              <td>${product.precio}</td>
              <td>{product.unidad}</td>
              <td>{product.cant_por_empaque}</td>
              <td className={styles.actionsCell}>
                <input type="number" min="1" defaultValue="1" className={styles.quantityInput} />
                <button className={styles.addToCartButton}>Agregar al carrito</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResults;
