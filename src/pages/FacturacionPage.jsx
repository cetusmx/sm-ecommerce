import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { sendFacturacionDocument } from '../api/facturacionService';
import styles from './FacturacionPage.module.css';

const FacturacionPage = () => {
  const { folio, total } = useParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const mutation = useMutation({
    mutationFn: () => sendFacturacionDocument(folio, selectedFile, total, email),
    onSuccess: (data) => {
      setMessage(data.message || 'Solicitud de facturación enviada con éxito.');
      setIsError(false);
      setTimeout(() => {
        navigate('/orders'); // Redirigir a la página de pedidos después del éxito
      }, 3000);
    },
    onError: (error) => {
      setMessage(error.message || 'Error al enviar la solicitud.');
      setIsError(true);
      setTimeout(() => setMessage(''), 5000);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
    } else {
      setSelectedFile(null);
      setMessage('Por favor, selecciona un archivo PDF.');
      setIsError(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Por favor, ingresa un correo electrónico.');
      setIsError(true);
      return;
    }
    if (!selectedFile) {
      setMessage('Por favor, adjunta tu Constancia de Situación Fiscal.');
      setIsError(true);
      return;
    }
    mutation.mutate();
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>Solicitud de Factura</h2>
        <p>Completa los siguientes datos para generar tu factura.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="folio">Folio del Pedido</label>
            <input type="text" id="folio" value={folio || ''} readOnly disabled />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="total">Total del Pedido</label>
            <input type="text" id="total" value={`$${total || '0.00'}`} readOnly disabled />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo para envío de factura</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              required
              disabled={mutation.isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pdfFile">Constancia de Situación Fiscal (PDF)</label>
            <input
              type="file"
              id="pdfFile"
              onChange={handleFileChange}
              accept=".pdf"
              required
              disabled={mutation.isPending}
            />
            {selectedFile && <span className={styles.fileName}>{selectedFile.name}</span>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
            {mutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>

        {message && (
          <p className={`${styles.message} ${isError ? styles.error : styles.success}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FacturacionPage;
