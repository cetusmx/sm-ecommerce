import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './ProductFilter.module.css';

const fetchCategories = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/categorias`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const excludedCategories = [
  "Accesorios", "Adhesivos", "Estuches", "Gato", "Graseras", 
  "Guías telescópicos", "Herramientas", "Kits telescópicos", 
  "Pernos", "Seguros externos", "Seguros internos"
];

const ProductFilter = ({ filters, onFilterChange }) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (fetchedCategories) => 
      fetchedCategories.filter(category => !excludedCategories.includes(category)),
  });

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
            value={filters.medida}
            onChange={handleInputChange}
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
            value={filters.sello}
            onChange={handleInputChange}
            disabled={isLoading || error}
          >
            <option value="Todos">Todos</option>
            {error && <option value="">Error al cargar</option>}
            {!isLoading && !error && categories && categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
