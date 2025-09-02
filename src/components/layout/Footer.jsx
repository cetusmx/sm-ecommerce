import React from 'react';
import styles from './Footer.module.css'; // Estilos del pie de página

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-content']}>
        <div className={`${styles['footer-section']} ${styles.contact}`}>
          <h4>Contacto</h4>
          <p>Email: info@ecommerce.com</p>
          <p>Teléfono: +123 456 7890</p>
        </div>
        <div className={`${styles['footer-section']} ${styles.links}`}>
          <h4>Enlaces de interés</h4>
          <ul>
            <li><a href="/privacy-policy">Política de Privacidad</a></li>
            <li><a href="/terms">Términos de Servicio</a></li>
            <li><a href="/returns">Política de Devoluciones</a></li>
          </ul>
        </div>
        <div className={`${styles['footer-section']} ${styles.social}`}>
          <h4>Síguenos</h4>
          <div className={styles['social-icons']}>
            {/* Íconos de redes sociales */}
            <a href="https://facebook.com" aria-label="Facebook"><span role="img" aria-label="facebook">📘</span></a>
            <a href="https://instagram.com" aria-label="Instagram"><span role="img" aria-label="instagram">📸</span></a>
            <a href="https://twitter.com" aria-label="Twitter"><span role="img" aria-label="twitter">🐦</span></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;