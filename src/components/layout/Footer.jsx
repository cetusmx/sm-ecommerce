import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './Footer.module.css';
import { FaUsers, FaBuilding, FaBook, FaInfoCircle, FaPhone, FaEnvelope, FaPaperPlane, FaChevronDown, FaSearch, FaUpload } from 'react-icons/fa';
import durangoImg from '@/assets/durango.png';
import zacatecasImg from '@/assets/zacatecas.png';
import mazatlanImg from '@/assets/mazatlan.png';
import queretaroImg from '@/assets/queretaro.png';
import logo from '@/assets/footer-logo.png';
import { searchOrderForFacturacion, sendFacturacionDocument } from '../../api/facturacionService';

const Footer = () => {
  const [showFacturacionForm, setShowFacturacionForm] = useState(false);
  const [folioPedido, setFolioPedido] = useState('');
  const [totalPedido, setTotalPedido] = useState('');
  const [orderFound, setOrderFound] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [facturacionMessage, setFacturacionMessage] = useState('');
  const [isFacturacionError, setIsFacturacionError] = useState(false);

  const searchOrderMutation = useMutation({
    mutationFn: () => searchOrderForFacturacion(folioPedido, totalPedido),
    onSuccess: (data) => {
      if (data.orderFound) {
        setOrderFound(true);
        setFacturacionMessage('');
      } else {
        setFacturacionMessage('Pedido no encontrado o el total no coincide.');
        setIsFacturacionError(true);
        setTimeout(() => setFacturacionMessage(''), 3000);
      }
    },
    onError: (error) => {
      setFacturacionMessage(error.message || 'Error al buscar el pedido.');
      setIsFacturacionError(true);
      setTimeout(() => setFacturacionMessage(''), 3000);
    },
  });

  const sendDocumentMutation = useMutation({
    mutationFn: () => sendFacturacionDocument(folioPedido, selectedFile, totalPedido),
    onSuccess: (data) => {
      setFacturacionMessage(data.message || 'Documento enviado exitosamente.');
      setIsFacturacionError(false);
      setTimeout(() => {
        setFacturacionMessage('');
        setShowFacturacionForm(false);
        setOrderFound(false);
        setFolioPedido('');
        setTotalPedido('');
        setSelectedFile(null);
      }, 3000);
    },
    onError: (error) => {
      setFacturacionMessage(error.message || 'Error al enviar el documento.');
      setIsFacturacionError(true);
      setTimeout(() => setFacturacionMessage(''), 3000);
    },
  });

  const handleFacturacionClick = (e) => {
    e.preventDefault();
    setShowFacturacionForm(!showFacturacionForm);
    setOrderFound(false);
    setFolioPedido('');
    setTotalPedido('');
    setSelectedFile(null);
    setFacturacionMessage('');
  };

  const handleSearchOrder = () => {
    if (folioPedido && totalPedido) {
      searchOrderMutation.mutate();
    } else {
      setFacturacionMessage('Por favor, ingrese el folio y el total del pedido.');
      setIsFacturacionError(true);
      setTimeout(() => setFacturacionMessage(''), 3000);
    }
  };

  const handleSendDocument = () => {
    if (selectedFile) {
      sendDocumentMutation.mutate();
    } else {
      setFacturacionMessage('Por favor, seleccione un archivo.');
      setIsFacturacionError(true);
      setTimeout(() => setFacturacionMessage(''), 3000);
    }
  };

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
          <p>
            <a href="#" onClick={handleFacturacionClick} className={styles.facturacionToggle}>
              Facturación <FaChevronDown className={`${styles.chevronIcon} ${showFacturacionForm ? styles.chevronOpen : ''}`} />
            </a>
          </p>
          {showFacturacionForm && (
            <div className={styles.facturacionForm}>
              {!orderFound ? (
                <>
                  <input
                    type="text"
                    placeholder="Ingrese folio Pedido"
                    className={styles.facturacionInput}
                    value={folioPedido}
                    onChange={(e) => setFolioPedido(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Ingrese el total del Pedido"
                    className={styles.facturacionInput}
                    value={totalPedido}
                    onChange={(e) => setTotalPedido(e.target.value)}
                  />
                  <button
                    className={styles.facturacionButton}
                    onClick={handleSearchOrder}
                    disabled={searchOrderMutation.isPending}
                  >
                    {searchOrderMutation.isPending ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button
                    className={styles.facturacionButton + ' ' + styles.cancelButton}
                    onClick={handleFacturacionClick}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <div className={styles.fileInputContainer}>
                  <p className={styles.fileInputInstruction}>Agrega tu Constancia de SF (.pdf)</p>
                  <input
                    type="file"
                    className={styles.fileInput}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type === 'application/pdf') {
                        setSelectedFile(file);
                        setFacturacionMessage('');
                      } else {
                        setSelectedFile(null);
                        setFacturacionMessage('Por favor, selecciona un archivo PDF.');
                        setIsFacturacionError(true);
                        setTimeout(() => setFacturacionMessage(''), 3000);
                      }
                    }}
                    accept=".pdf"
                  />
                  <button
                    className={styles.facturacionButton}
                    onClick={handleSendDocument}
                    disabled={sendDocumentMutation.isPending || !selectedFile}
                  >
                    {sendDocumentMutation.isPending ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    className={styles.facturacionButton + ' ' + styles.cancelButton}
                    onClick={handleFacturacionClick}
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {facturacionMessage && (
                <p className={isFacturacionError ? styles.facturacionMessage + ' ' + styles.error : styles.facturacionMessage + ' ' + styles.success}>
                  {facturacionMessage}
                </p>
              )}
            </div>
          )}
          <p><a href="/contacto">Contacto</a></p>
        </div>
      </div>

      <div className={styles.copyrightSection}>
        <p>&copy; 2025 All rights reserved</p>
        <img src={logo} alt="Company Logo" className={styles.copyrightLogo} />
      </div>
    </footer>
  );
};

export default Footer;