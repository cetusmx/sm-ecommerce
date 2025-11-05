import React, { useState } from 'react';
import styles from './DeliveryOptionsStep.module.css';
import { formatDeliveryDateLowercase } from '../../../utils/formatosFechas';

const DeliveryOptionsStep = ({ cart, fechasDeEntrega, onSelection, selectedPreference }) => {
  // Group products by delivery date
  const groupedByDate = cart.reduce((acc, item) => {
    const entrega = fechasDeEntrega.find(f => f.clave === item.clave);
    const fecha = entrega ? entrega.fecha : 'Fecha no disponible'; //fechaCorta
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(item);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <h2>Opciones de Entrega</h2>
      <p>Algunos de tus productos tienen diferentes fechas de entrega. ¿Cómo te gustaría recibirlos?</p>
      
      <div className={styles.optionsContainer}>
        <div 
          className={`${styles.optionCard} ${selectedPreference === 'single' ? styles.selected : ''}`}
          onClick={() => onSelection('single')}
        >
          <input 
            type="radio" 
            name="deliveryOption" 
            value="single" 
            checked={selectedPreference === 'single'}
            onChange={() => {}} // onChange is required for controlled components
          />
          <div>
            <h5>Enviar todo junto</h5>
            <p>Recibirás todos tus productos en un solo paquete en la fecha de entrega más lejana.</p>
          </div>
        </div>
        <div 
          className={`${styles.optionCard} ${selectedPreference === 'separate' ? styles.selected : ''}`}
          onClick={() => onSelection('separate')}
        >
          <input 
            type="radio" 
            name="deliveryOption" 
            value="separate" 
            checked={selectedPreference === 'separate'}
            onChange={() => {}} // onChange is required for controlled components
          />
          <div>
            <h5>Enviar por separado</h5>
            <p>Recibirás tus productos a medida que estén disponibles. Esto puede incurrir en costos de envío adicionales.</p>
          </div>
        </div>
      </div>

      <div className={styles.productGroups}>
        {Object.entries(groupedByDate).map(([fecha, productos]) => (
          <div key={fecha} className={styles.groupCard}>
            <h5 className={styles.deliveryDate}>Entrega estimada: {fecha}</h5>
            <ul>
              {productos.map(p => {
                const entrega = fechasDeEntrega.find(f => f.clave === p.clave);
                return (
                  <li key={p.clave} className={styles.summaryItem}>
                    <div className={styles.itemDetails}>
                      <span>{p.clave} x {p.quantity}</span>
                      {p.descripcion && <p className={styles.productDescription}>{p.descripcion}</p>}
                    </div>
                    <span className={styles.itemPrice}>${(p.precio * p.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryOptionsStep;
