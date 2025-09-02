import React, { useState } from 'react';
import styles from './SpecSearchBlock.module.css'; // Importa los estilos

const SpecSearchBlock = () => {
  const [searchSpecs, setSearchSpecs] = useState({
    medida: '',
    sello: '',
    di: '',
    de: '',
    altura: ''
  });

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSearchSpecs(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSearchSpecs = () => {
    // Lógica para enviar la búsqueda al backend
    console.log("Buscando con especificaciones:", searchSpecs);
    alert('Búsqueda de producto activada. Revisa la consola.');
  };

  return (
    <section className={styles['spec-search-block']}>
      <h2>Encuentra tu Producto Ideal</h2>
      <div className={styles['spec-form']}>
        <div className={styles['form-group']}>
          <label htmlFor="medida">Sistema de Medición (opcional)</label>
          <input
            type="text"
            id="medida"
            name="medida"
            placeholder="Ej. Métrico, Imperial"
            value={searchSpecs.medida}
            onChange={handleSpecChange}
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="sello">Tipo de Sello (opcional)</label>
          <input
            type="text"
            id="sello"
            name="sello"
            placeholder="Ej. O-Ring, Retén"
            value={searchSpecs.sello}
            onChange={handleSpecChange}
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="di">Diámetro Interior (mm/pulgadas)</label>
          <input
            type="number"
            id="di"
            name="di"
            placeholder="mm / pulgadas"
            value={searchSpecs.di}
            onChange={handleSpecChange}
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="de">Diámetro Exterior (mm/pulgadas)</label>
          <input
            type="number"
            id="de"
            name="de"
            placeholder="mm / pulgadas"
            value={searchSpecs.de}
            onChange={handleSpecChange}
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="altura">Altura (mm/pulgadas)</label>
          <input
            type="number"
            id="altura"
            name="altura"
            placeholder="mm / pulgadas"
            value={searchSpecs.altura}
            onChange={handleSpecChange}
          />
        </div>
        <button onClick={handleSearchSpecs} className={styles['search-spec-btn']}>
          Buscar Productos
        </button>
      </div>
    </section>
  );
};

export default SpecSearchBlock;