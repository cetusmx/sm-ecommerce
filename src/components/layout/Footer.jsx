import React from 'react';
import styles from './Footer.module.css';
import { FaUsers, FaBuilding, FaBook, FaInfoCircle, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import durangoImg from '@/assets/durango.png';
import zacatecasImg from '@/assets/zacatecas.png';
import mazatlanImg from '@/assets/mazatlan.png';
import queretaroImg from '@/assets/queretaro.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.column} style={{ width: '25%' }}>
        <div className={styles.titleContainer}>
          <div className={styles.iconWrapper}>
            <FaUsers className={styles.icon} />
          </div>
          <h3>Nosotros</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.infoItem}>
            <p>Somos una empresa dedicada a proveer soluciones de sellado de alta calidad para la industria.</p>
          </div>
          <div className={styles.infoItem}>
            <FaPhone className={styles.infoIcon} />
            <p className={styles.highlightText}>+52 618 230 3777</p>
          </div>
          <div className={styles.infoItem}>
            <FaEnvelope className={styles.infoIcon} />
            <p className={styles.highlightText}>contacto@sealmarket.mx</p>
          </div>
          <div className={styles.newsletterForm}>
            <input type="text" placeholder="Tu correo electrónico" className={styles.newsletterInput} />
            <button className={styles.newsletterButton}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.column} style={{ width: '50%' }}>
        <div className={styles.titleContainer}>
          <div className={styles.iconWrapper}>
            <FaBuilding className={styles.icon} />
          </div>
          <h3>Sucursales</h3>
        </div>
        <div className={styles.branchesGrid}>
          <div className={styles.branch}>
            <a href="https://maps.app.goo.gl/CupghVrZnCfY169H6" target="_blank" rel="noopener noreferrer">
              <img src={durangoImg} alt="Sucursal Durango" className={styles.branchImage} />
            </a>
            <div className={styles.branchAddress}>
              <p className={styles.branchTitle}><strong>Sucursal Durango</strong></p>
              <a href="https://maps.app.goo.gl/CupghVrZnCfY169H6" target="_blank" rel="noopener noreferrer">
                <p>Prol. Pino Suárez 3012, Col. J. Guadalupe Rodríguez, CP 34280, Durango, Dgo.</p>
              </a>
            </div>
          </div>
          <div className={styles.branch}>
            <a href="https://maps.app.goo.gl/BuSK4ovNMy7ffARv6" target="_blank" rel="noopener noreferrer">
              <img src={zacatecasImg} alt="Sucursal Zacatecas" className={styles.branchImage} />
            </a>
            <div className={styles.branchAddress}>
              <p className={styles.branchTitle}><strong>Sucursal Zacatecas</strong></p>
              <a href="https://maps.app.goo.gl/BuSK4ovNMy7ffARv6" target="_blank" rel="noopener noreferrer">
                <p>Av. Conventos 1, Fracc. Los Conventos, CP 98612, Guadalupe, Zac.</p>
              </a>
            </div>
          </div>
          <div className={styles.branch}>
            <a href="https://maps.app.goo.gl/TU5akHgufG9hVSgf9" target="_blank" rel="noopener noreferrer">
              <img src={mazatlanImg} alt="Sucursal Mazatlán" className={styles.branchImage} />
            </a>
            <div className={styles.branchAddress}>
              <p className={styles.branchTitle}><strong>Sucursal Mazatlán</strong></p>
              <a href="https://maps.app.goo.gl/TU5akHgufG9hVSgf9" target="_blank" rel="noopener noreferrer">
                <p>Gabriel Leyva 4020 Local 3, Col. Jesús García, CP 82180, Mazatlán, Sin.</p>
              </a>
            </div>
          </div>
          <div className={styles.branch}>
            <a href="https://maps.app.goo.gl/pisoovcgnQpiZZaUA" target="_blank" rel="noopener noreferrer">
              <img src={queretaroImg} alt="Sucursal Querétaro" className={styles.branchImage} />
            </a>
            <div className={styles.branchAddress}>
              <p className={styles.branchTitle}><strong>Sucursal Querétaro</strong></p>
              <a href="https://maps.app.goo.gl/pisoovcgnQpiZZaUA" target="_blank" rel="noopener noreferrer">
                <p>Blvd. Peña Flor 1102, CP 76116, Santiago de Querétaro, Qro.</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.column} style={{ width: '25%' }}>
        <div className={styles.titleContainer}>
          <div className={styles.iconWrapper}>
            <FaBook className={styles.icon} />
          </div>
          <h3>Información</h3>
        </div>
        <div className={styles.infoLinks}>
          <p><a href="/politicas-de-privacidad">Políticas de privacidad</a></p>
          <p><a href="/facturacion">Facturación</a></p>
          <p><a href="/contacto">Contacto</a></p>
        </div>
      </div>

      <div className={styles.copyrightSection}>
        <p>&copy; 2025 All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
