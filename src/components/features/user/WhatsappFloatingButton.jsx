// WhatsappFloatingButton.jsx
import { FaWhatsapp } from "react-icons/fa";
import React from 'react';

const WHATSAPP_LINK = "https://wa.me/5216182303777?text=Hola,%2C%20estoy%2C%20en%2C%20la%2C%20tienda%2C%20y%2C%20necesito%20ayuda%20con%20una%20duda.";

const styles = {
  button: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    backgroundColor: '#25D366', // Color oficial de WhatsApp
    color: 'white',
    width: '55px',
    height: '55px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    textDecoration: 'none', // Para remover el subrayado del enlace
  },
  icon: {
    // Puedes usar una librería de íconos (ej. Font Awesome) o un simple 'W' o emoji
  }
};

const WhatsappFloatingButton = () => {
  return (
    <a 
      href={WHATSAPP_LINK}
      target="_blank" // Abre en una nueva pestaña
      rel="noopener noreferrer"
      style={styles.button}
      title="Chatea con nosotros por WhatsApp"
    >
     <FaWhatsapp /> 
    </a>
  );
};

export default WhatsappFloatingButton;