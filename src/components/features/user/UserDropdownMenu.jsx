import React from 'react';
import { Link } from 'react-router-dom';
import styles from './UserDropdownMenu.module.css';

const UserDropdownMenu = ({ isVisible, isLoggedIn, onLogout }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles['user-dropdown-menu']}>
      <ul>
        {isLoggedIn ? (
          <>
            <li><Link to="/profile">Mi Perfil</Link></li>
            <li><Link to="/orders">Mis Pedidos</Link></li>
            <li onClick={onLogout}>Cerrar Sesión</li>
          </>
        ) : (
          <>
            <li><Link to="/login">Ingresar</Link></li>
            <li><Link to="/signup">Registrarse</Link></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default UserDropdownMenu;
