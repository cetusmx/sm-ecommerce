import React from 'react';
import styles from './ProductFilter.module.css';

const ProductFilter = ({ filters, onFilterChange }) => {

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className={styles['main-container-filtros']}>
      <div className={styles['leyenda-filtros']}>
        <h4>Encuentra</h4>
        <h6>Tu Sello</h6>
      </div>
      <div className={styles['filter-container']}>
        <div className={`${styles['filter-box']} ${styles.large}`}>
          <label htmlFor="medida">Sistema de medición</label>
          <select
            id="medida"
            name="medida"
            // El valor y el controlador para este campo se pueden agregar más tarde si es necesario
          >
            <option value="Pulgadas">Pulgadas</option>
            <option value="Milímetros">Milímetros</option>
          </select>
        </div>

        <div className={`${styles['filter-box']} ${styles.large}`}>
          <label htmlFor="sello">Tipo sello</label>
          <select
            id="sello"
            name="sello"
            // El valor y el controlador para este campo se pueden agregar más tarde si es necesario
          >
            <option value="Todos">Todos</option>
            <option value="Buffer">Buffer</option>
            <option value="Sello de pistón">Sello de pistón</option>
            <option value="Sello de vástago">Sello de vástago</option>
            <option value="Sello U">Sello U</option>
            <option value="Guías desgaste">Guías desgaste</option>
            <option value="Limpiadores">Limpiadores</option>
            <option value="Orings">Orings</option>
            <option value="Respaldos">Respaldos</option>
            <option value="Retenes">Retenes</option>
            <option value="Chevron">Chevron</option>
          </select>
        </div>

        <div className={`${styles['filter-box']} ${styles.small}`}>
          <label htmlFor="diamInt">DI</label>
          <input
            type="number"
            id="diamInt"
            name="diamInt"
            value={filters.diamInt}
            onChange={handleInputChange}
            placeholder="ej. 1.25"
          />
        </div>

        <div className={`${styles['filter-box']} ${styles.small}`}>
          <label htmlFor="diamExt">DE</label>
          <input
            type="number"
            id="diamExt"
            name="diamExt"
            value={filters.diamExt}
            onChange={handleInputChange}
            placeholder="ej. 2.0"
          />
        </div>

        <div className={`${styles['filter-box']} ${styles.small}`}>
          <label htmlFor="altura">Altura</label>
          <input
            type="number"
            id="altura"
            name="altura"
            value={filters.altura}
            onChange={handleInputChange}
            placeholder="ej. 0.25"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
