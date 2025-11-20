import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import ReCAPTCHA from 'react-google-recaptcha';
import { enviarContacto } from '../api/contactoService';
import styles from './ContactPage.module.css';
import logo from '../assets/logo.png';
import ProductosPromocion from '../components/features/product/ProductosPromocion'; // Importar el componente ProductosPromocion
import BranchInfo from '../components/common/BranchInfo'; // Importar el nuevo componente

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: '',
    telefono: '',
  });
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const mutation = useMutation({
    mutationFn: (data) => enviarContacto({ ...data, recaptchaToken }),
    onSuccess: () => {
      setStatusMessage({ type: 'success', message: '¡Mensaje enviado con éxito! Gracias por contactarnos.' });
      setFormData({ nombre: '', email: '', mensaje: '', telefono: '' });
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    },
    onError: (error) => {
      setStatusMessage({ type: 'error', message: `Error: ${error.message}` });
    },
  });

  useEffect(() => {
    if (statusMessage.message) {
      const timer = setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      setStatusMessage({ type: 'error', message: 'Por favor, completa el reCAPTCHA.' });
      return;
    }

    if (formData.telefono && !/^\d*$/.test(formData.telefono)) {
        setStatusMessage({ type: 'error', message: 'El teléfono solo debe contener números.' });
        return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.titleContainer}>
        <h1>Contacto</h1>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.promoSection}>
          <ProductosPromocion />
        </div>
        <div className={styles.formContainer}>
          <p>¿Tienes alguna pregunta? Envíanos un mensaje y te responderemos a la brevedad.</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={mutation.isPending}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={mutation.isPending}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="telefono">Teléfono (Opcional)</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={mutation.isPending}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows="6"
                disabled={mutation.isPending}
              ></textarea>
            </div>
            
            <div className={styles.recaptchaContainer}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY_HERE"}
                onChange={handleRecaptchaChange}
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
          {statusMessage.message && (
            <div className={`${styles.statusMessage} ${styles[statusMessage.type]}`}>
              {statusMessage.message}
            </div>
          )}
        </div>
        <div className={styles.branchSection}>
          <BranchInfo />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
