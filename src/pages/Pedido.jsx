// src/pages/Pedido.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Assuming @ alias works for context
import styles from './Pedido.module.css';

const Pedido = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getUserDisplayName = () => {
    if (!currentUser) return 'Usuario';
    if (currentUser.displayName) {
      const nameParts = currentUser.displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      return `${firstName} ${lastName}`.trim();
    }
    return currentUser.email.split('@')[0];
  };

  const formatDateToSpanish = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  };

  // Authentication check
  useEffect(() => {
    if (!authLoading && !currentUser) {
      // If not logged in, redirect to login, then back to /orders
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [currentUser, authLoading, navigate, location.pathname]);

  if (authLoading || !currentUser) {
    // Show a loading state or null while authentication is being checked
    return <div className={styles['loading-container']}>Cargando pedidos...</div>;
  }

  // --- Placeholder for actual content ---
  return (
    <div className={styles['main-container']}>
      {/* Breadcrumb */}
      <div className={styles['breadcrumb']}>
        <span style={{ color: '#2177c2' }}>Mi cuenta</span>
        <span style={{ color: '#131921', margin: '0 5px' }}>&gt;</span>
        <span style={{ color: '#c7562a' }}>Mis pedidos</span>
      </div>

      <div className={styles['top-section']}>
        {/* Contenedor Izquierdo Superior (75%) */}
        <div className={styles['contenedor-izq-top']}>
          <div className={styles['title-and-search']}>
            <h1 className={styles['page-title']}>Mis pedidos</h1>
            <div className={styles['search-component']}>
              <input type="text" placeholder="Buscar pedidos..." className={styles['search-input']} />
              <button className={styles['search-button']}>Buscar pedidos</button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles['tabs-menu']}>
            <button className={`${styles['tab-button']} ${styles.active}`}>Pedidos</button>
            <button className={styles['tab-button']}>Pendiente de envío</button>
            <button className={styles['tab-button']}>Pedidos cancelados</button>
          </div>

          {/* Order Count & Dropdown */}
          <div className={styles['order-summary']}>
            <span>6 pedidos realizados en </span>
            <select className={styles['period-dropdown']}>
              <option>últimos 3 meses</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
              <option>2020</option>
              <option>Todos</option>
            </select>
          </div>
        </div>

        {/* Contenedor Derecho Superior (25%) */}
        <div className={styles['contenedor-der-top']}>
          <p className={styles['promo-message']}>Obtén los mejores precios incrementando tu número de compras</p>
          <button className={styles['promo-button']}>Ver más</button>
        </div>
      </div>

      {/* Contenedor Izquierdo Inferior (Lista de Pedidos) */}
      <div className={styles['contenedor-izq-bot']}>
        {/* Placeholder for order cards */}
        <div className={styles['order-card']}>
          <div className={styles['card-header']}>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>PEDIDO REALIZADO</span>
              <span className={styles['header-value']}>{formatDateToSpanish("2024-07-26")}</span>
            </div>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>TOTAL</span>
              <span className={styles['header-value']}>$120.00</span>
            </div>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>ENVIAR A</span>
              <span className={styles['header-value']}>{getUserDisplayName()}</span>
            </div>
          </div>
          <div className={styles['card-body']}>
            <div className={styles['product-details']}>
              <span className={styles['delivery-date-label']}>Fecha de entrega</span>
              {/* Product Component Placeholder */}
              <div className={styles['product-component-placeholder']}>Producto Placeholder</div>
            </div>
            <div className={styles['action-buttons']}>
              <button className={styles['action-button']}>Facturar</button>
              <button className={styles['action-button']}>Ver detalles</button>
              <button className={styles['action-button']}>Escribir opinión del producto</button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor Derecho Inferior (Sidebar de Ofertas) */}
      <div className={styles['contenedor-der-bot']}>
        {/* Placeholder for offers */}
        <p>Ofertas vigentes o sugerencias aquí.</p>
      </div>
    </div>
  );
};

export default Pedido;
