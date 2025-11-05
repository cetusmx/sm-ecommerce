import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from './UserSession.module.css';
import { IoMdArrowDropdown } from 'react-icons/io';
import logo from '@/assets/logo.png';

const UserSession = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { currentUser, logout } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const allProducts = queryClient.getQueryData(['products']);

  // Query for user's orders
  const { data: pedidos } = useQuery({
    queryKey: ['pedidos', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      const response = await fetch(`http://localhost:3004/api/pedidos/cliente/${currentUser.email}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!currentUser && isDropdownVisible, // Fetch only when user is logged in and dropdown is visible
  });

  // Query for suggested products (raw data)
  const { data: suggestedProductsRaw } = useQuery({
    queryKey: ['sugeridos'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sugeridos`);
      if (!response.ok) {
        throw new Error('Network response was not ok for suggested products');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Enrich suggested products with full details from allProducts
  const suggestedProducts = useMemo(() => {
    if (!suggestedProductsRaw || !allProducts) return [];
    return suggestedProductsRaw.map(suggProd => {
      const fullProduct = allProducts.find(p => p.clave === suggProd.clave);
      return fullProduct ? { ...suggProd, ...fullProduct } : suggProd; // Merge if found, otherwise use raw
    });
  }, [suggestedProductsRaw, allProducts]);

  const lastThreeProducts = useMemo(() => {
    if (!pedidos || pedidos.length === 0 || !allProducts) return [];
    
    const allItems = pedidos.flat();
    const uniqueItems = [];
    const seenClaves = new Set();

    for (const item of allItems) {
      if (!seenClaves.has(item.clave)) {
        seenClaves.add(item.clave);
        // Enrich the item with full product details from the cache
        const productDetails = allProducts.find(p => p.clave === item.clave);
        if (productDetails && productDetails.existencia > 0) {
          uniqueItems.push({ ...item, ...productDetails });
        }
      }
    }
    return uniqueItems.slice(0, 3);
  }, [pedidos, allProducts]);

  const handleToggleDropdown = () => {
    setIsDropdownVisible(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsDropdownVisible(false); // Close dropdown after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getUserName = () => {
    if (!currentUser) return 'Identifícate';
    if (currentUser.displayName) return currentUser.displayName.split(' ')[0];
    return currentUser.email.split('@')[0];
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    setIsDropdownVisible(false); // Close dropdown after adding to cart
  };

  const getProductImageUrl = (product) => {
    const perfilesUrl = `/Perfiles/${product.linea}.jpg`;
    const sugeridosUrl = `/Sugeridos/${product.clave}.jpg`;
    return (product.categoria === 'Herramientas' || product.categoria === 'Accesorios')
      ? sugeridosUrl
      : perfilesUrl;
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setIsDropdownVisible(false);
  };

  const renderProductList = (productsToRender) => (
    <div className={styles.buyAgainList}>
      {productsToRender.length > 0 ? (
        productsToRender.map(prod => (
          <div key={prod.clave} className={styles.buyAgainProduct}>
            <img src={getProductImageUrl(prod)} alt={prod.descripcion} className={styles.productImage} />
            <div className={styles.productInfo}>
              <Link to={`/producto/${prod.clave}?imageUrl=${encodeURIComponent(getProductImageUrl(prod))}`} className={styles.productDescriptionLink} onClick={(e) => handleDropdownClick(e)}>
                <p className={styles.productDescription}>{prod.descripcion}</p>
              </Link>
              <div className={styles.priceRow}>
                <p className={styles.price}>${parseFloat(prod.precio).toFixed(2)}</p>
                <img src={logo} alt="Logo" className={styles.logo} />
              </div>
              <button onClick={() => handleAddToCart(prod)} className={`${styles.addToCartBtnSmall} sm-btn sm-btn-primary`}>Agregar al carrito</button>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.noProducts}>No hay productos disponibles.</p>
      )}
    </div>
  );

  return (
    <div
      className={styles['user-session-container']}
      onClick={handleToggleDropdown}
    >
      <div className={styles['user-info']}>
        <span className={styles['greeting']}>Hola,</span>
        <span className={styles['username']}>
          {getUserName()}
        </span>
      </div>
      <IoMdArrowDropdown className={styles['dropdown-arrow']} />
      
      {isDropdownVisible && (
        <div className={styles.overlay} onClick={(e) => handleDropdownClick(e)}></div>
      )}

      {isDropdownVisible && (
        <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}> 
          <div className={styles.columnsContainer}>
            {/* LEFT COLUMN */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>
                {currentUser && lastThreeProducts.length > 0 ? "Comprar nuevamente" : "Productos sugeridos"}
              </h3>
              {currentUser && lastThreeProducts.length > 0 ? (
                // Logged-in with recent orders: Show last three products
                <>
                  <Link to="/pedido" className={styles.link} onClick={(e) => handleDropdownClick(e)}>Ver todos</Link>
                  {renderProductList(lastThreeProducts)}
                </>
              ) : (
                // Logged-in without recent orders OR Not logged in: Show suggested products
                renderProductList(suggestedProducts ? suggestedProducts.slice(0, 3) : [])
              )}
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* RIGHT COLUMN */}
            <div className={styles.column}>
              {currentUser ? (
                // Logged-in: My Account
                <>
                  <h3 className={styles.columnTitle}>Mi cuenta</h3>
                  <div className={styles.accountLinks}>
                    <Link to="/perfil" className={styles.accountLink} onClick={(e) => handleDropdownClick(e)}>Mi perfil</Link>
                    <Link to="/pedido" className={styles.accountLink} onClick={(e) => handleDropdownClick(e)}>Mis pedidos</Link>
                    <button onClick={handleLogout} className={styles.accountLink}>Cerrar sesión</button>
                  </div>
                </>
              ) : (
                // Not logged in: Login/Register
                <>
                  <h3 className={styles.columnTitle}>Identifícate</h3>
                  <div className={styles.accountLinks}> 
                    <button onClick={(e) => { navigate('/login'); handleDropdownClick(e); }} className={`${styles.accountLink} sm-btn sm-btn-primary`}>Iniciar sesión</button> 
                    <Link to="/signup" className={styles.accountLink} onClick={(e) => handleDropdownClick(e)}>Regístrate</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default UserSession;
