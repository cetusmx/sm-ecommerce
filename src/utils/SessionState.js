import React from 'react';
import PropTypes from 'prop-types';

const SessionState = ({ userName, cartCount, totalPrice }) => {
  return (
    <div className="user-cart">
      <a href="/profile" className="user-profile">
        <span role="img" aria-label="user-icon">👤</span>
        <span>{userName}</span>
      </a>
      <a href="/cart" className="cart-icon">
        <span role="img" aria-label="cart-icon">🛒</span>
        <span className="cart-count">{cartCount}</span>
        <span className="cart-price">${totalPrice.toFixed(2)}</span>
      </a>
    </div>
  );
};

// Validar las props con PropTypes (opcional pero recomendado)
SessionState.propTypes = {
  userName: PropTypes.string.isRequired,
  cartCount: PropTypes.number.isRequired,
  totalPrice: PropTypes.number.isRequired,
};

export default SessionState;