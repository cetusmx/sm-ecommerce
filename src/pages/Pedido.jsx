import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import styles from './Pedido.module.css';
import OrderItem from '@/components/features/order/OrderItem';

import ProductosPromocion from '@/components/features/product/ProductosPromocion'; // Import the new component
import ProductosVistos from '@/components/features/product/ProductosVistos'; // Import ProductosVistos
import ModalDomicilio from '../components/common/ModalDomicilio';

const Pedido = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('Pedidos');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('últimos 3 meses');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch all orders for the current user
  const { data: pedidos, isLoading, error } = useQuery({
    queryKey: ['pedidos', currentUser?.email],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3004/api/pedidos/cliente/${currentUser.email}`);
      if (!response.ok) {
        if (response.status === 404) { // If 404 (Not Found), it means no orders for this user, return empty array
          return [];
        }
        throw new Error('Error al obtener los pedidos');
      }
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
      if (!response.ok) {
        throw new Error('Network response was not ok for products');
      }
      return response.json();
    },
  });

  const { data: viewedProducts } = useQuery({
    queryKey: ['productosVistos', currentUser?.email],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/productosvistos/email/${currentUser.email}`);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Error al obtener los productos vistos');
      }
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  // Group orders by folio
  const pedidosAgrupados = useMemo(() => {
    if (!pedidos) return {};
    return pedidos.reduce((acc, item) => {
      acc[item.folio] = acc[item.folio] || [];
      acc[item.folio].push(item);
      return acc;
    }, {});
  }, [pedidos]);

  const filteredOrders = useMemo(() => {
    let orders = Object.values(pedidosAgrupados);

    // 1. Filter by Date Range
    const now = new Date();
    if (dateRange === 'últimos 3 meses') {
      const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
      orders = orders.filter(order => new Date(order[0].createdAt) >= threeMonthsAgo);
    } else if (dateRange !== 'Todos') { // Handle year filters
      const year = parseInt(dateRange, 10);
      orders = orders.filter(order => new Date(order[0].createdAt).getFullYear() === year);
    }

    // 2. Filter by active tab
    if (activeTab === 'Pendiente de envío') {
      orders = orders.filter(order => order[0].estatus === 'Pendiente de envío');
    }

    // 3. Filter by search term
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      orders = orders.filter(order => {
        const folioMatch = order[0].folio.toLowerCase().includes(lowercasedSearchTerm);
        const itemMatch = order.some(item => 
          item.clave.toLowerCase().includes(lowercasedSearchTerm) ||
          item.descripcion.toLowerCase().includes(lowercasedSearchTerm)
        );
        return folioMatch || itemMatch;
      });
    }

    return orders;
  }, [pedidosAgrupados, activeTab, searchTerm, dateRange]);


  const formatDateToSpanish = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  };

  // Authentication check
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [currentUser, authLoading, navigate, location.pathname]);

  if (authLoading || !currentUser || isLoading || isLoadingProducts) {
    return <div className={styles['loading-container']}>Cargando pedidos...</div>;
  }

  if (error || productsError) {
    return <div className={styles['loading-container']}>Error: {error?.message || productsError?.message}</div>;
  }

  const OrderCard = ({ orderItems, products }) => {
    const pedidoConDetalles = orderItems.map(item => {
      const productInfo = products.find(p => p.clave === item.clave);
      return {
        ...item,
        linea: productInfo?.linea,
        categoria: productInfo?.categoria,
      };
    });

    const fechaEntrega = orderItems[0].fecha_entrega 
      ? formatDateToSpanish(orderItems[0].fecha_entrega)
      : 'Fecha no disponible';

    return (
      <div className={styles['order-card']}>
        <div className={styles['card-header']}>
          <div className={styles['header-left']}>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>PEDIDO REALIZADO</span>
              <span className={styles['header-value']}>{formatDateToSpanish(orderItems[0].createdAt)}</span>
            </div>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>TOTAL</span>
              <span className={styles['header-value']}>${orderItems.reduce((acc, item) => acc + parseFloat(item.total_partida), 0).toFixed(2)}</span>
            </div>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>ENVIAR A</span>
              <span className={styles['header-value']}>{orderItems[0].enviar_a}</span>
            </div>
          </div>
          <div className={styles['header-right']}>
            <div className={styles['header-item']}>
              <span className={styles['header-label']}>PEDIDO NUM. {orderItems[0].folio}</span>
              <button className={styles['link-button']}>Solicitar factura</button>
            </div>
          </div>
        </div>
        <div className={styles['card-body']}>
          {pedidoConDetalles.map(item => (
            <OrderItem key={item.id} item={item} />
          ))}
        </div>
        <div className={styles['card-footer']}>
          <p><span className={styles['footer-label']}>Fecha de entrega:</span> {fechaEntrega}</p>
          <p className={styles['order-status']}>Estatus: {orderItems[0].estatus}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles['main-container']}>
      <div className={styles['breadcrumb']}>
        <span style={{ color: '#2177c2' }}>Mi cuenta</span>
        <span style={{ color: '#131921', margin: '0 5px' }}>&gt;</span>
        <span style={{ color: '#c7562a' }}>Mis pedidos</span>
      </div>

      <div className={styles['top-section']}>
        <div className={styles['contenedor-izq-top']}>
          <div className={styles['title-and-search']}>
            <h1 className={styles['page-title']}>Mis pedidos</h1>
            <div className={styles['search-component']}>
              <input 
                type="text" 
                placeholder="Buscar en todos los pedidos..." 
                className={styles['search-input']} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className={styles['search-button']}>Buscar pedidos</button>
            </div>
          </div>
          <div className={styles['tabs-menu']}>
            <button 
              className={`${styles['tab-button']} ${activeTab === 'Pedidos' ? styles.active : ''}`}
              onClick={() => setActiveTab('Pedidos')}
            >Pedidos</button>
            <button 
              className={`${styles['tab-button']} ${activeTab === 'Pendiente de envío' ? styles.active : ''}`}
              onClick={() => setActiveTab('Pendiente de envío')}
            >Pendiente de envío</button>
          </div>
          <div className={styles['order-summary']}>
            <span>{filteredOrders.length} pedidos realizados en </span>
            <select 
              className={styles['period-dropdown']}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>últimos 3 meses</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
              <option>Todos</option>
            </select>
          </div>
        </div>
        <div className={styles['contenedor-der-top']}>
          <p className={styles['promo-message']}>Obtén los mejores precios incrementando tu número de compras</p>
          <button className={styles['promo-button']}>Ver más</button>
        </div>
      </div>

      <div 
        style={{
          display: "flex",
          gap: "2%", /* Changed from 20px to 2% */
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div className={styles['contenedor-izq-bot']}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(orderItems => (
              <OrderCard key={orderItems[0].folio} orderItems={orderItems} products={products} />
            ))
          ) : (
            <p>No se encontraron pedidos que coincidan con tus filtros.</p>
          )}
        </div>

        <div className={styles['contenedor-der-bot']}>
          <ProductosPromocion />
        </div>
      </div>
      {viewedProducts && viewedProducts.length > 0 && <ProductosVistos viewedProducts={viewedProducts} />}
    </div>
  );
};

export default Pedido;
