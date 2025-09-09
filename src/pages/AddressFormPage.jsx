import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './AddressFormPage.module.css';
import { useAuth } from '@/context/AuthContext';

const saveAddress = async (addressData) => {
  console.log("Dentro saveAddress", addressData);
  const { id, ...data } = addressData;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${process.env.REACT_APP_API_URL}/domicilios/${id}` : `${process.env.REACT_APP_API_URL}/domicilios`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al guardar la dirección');
  }

  const responseText = await response.text();
  if (responseText) {
    return JSON.parse(responseText);
  }

  return null;
};

const AddressFormPage = ({ onSave, address }) => {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email;

  const [formData, setFormData] = useState({
    nombre_completo: '',
    calle: '',
    numero_ext: '',
    numero_int: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    pais: 'México',
    referencia: '',
    instrucciones_entrega: '',
    clienteEmail: userEmail,
    numero_telefono: '',
    orden_domicilio: '',
  });

  useEffect(() => {
    if (address) {
      setFormData({
        id: address.id,
        nombre_completo: address.nombre_completo || '',
        calle: address.calle || '',
        numero_ext: address.numero_ext || '',
        numero_int: address.numero_int || '',
        colonia: address.colonia || '',
        ciudad: address.ciudad || '',
        estado: address.estado || '',
        codigo_postal: address.codigo_postal || '',
        pais: address.pais || 'México',
        referencia: address.referencia || '',
        instrucciones_entrega: address.instrucciones_entrega || '',
        clienteEmail: userEmail,
        numero_telefono: address.numero_telefono || '',
        orden_domicilio: address.orden_domicilio || '',
      });
    } else {
      setFormData({
        nombre_completo: '',
        calle: '',
        numero_ext: '',
        numero_int: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        pais: 'México',
        referencia: '',
        instrucciones_entrega: '',
        clienteEmail: userEmail,
        numero_telefono: '',
        orden_domicilio: '',
      });
    }
  }, [address, userEmail]);

  const mutation = useMutation({ 
    mutationFn: saveAddress, 
    onSuccess: () => {
      console.log('Dirección guardada con éxito!');
      alert('Dirección guardada con éxito!');
      if (onSave) {
        onSave();
      }
    },
    onError: (error) => {
      console.error('Failed to save address:', error);
      alert(error.message);
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (checked ? 'Predeterminado' : '') : value,
    }));
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userEmail) {
      alert('Debes iniciar sesión para guardar una dirección.');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className={styles.container}>
      <h2>Captura tu Domicilio</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Form fields remain the same */}
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Nombre Completo</label>
          <input
            type="text"
            id="fullName"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="street">Calle</label>
          <input
            type="text"
            id="street"
            name="calle"
            value={formData.calle}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="outsideNumber">Número Exterior</label>
            <input
              type="text"
              id="outsideNumber"
              name="numero_ext"
              value={formData.numero_ext}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="insideNumber">Número Interior (Opcional)</label>
            <input
              type="text"
              id="insideNumber"
              name="numero_int"
              value={formData.numero_int}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="neighborhood">Colonia</label>
          <input
            type="text"
            id="neighborhood"
            name="colonia"
            value={formData.colonia}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city">Ciudad</label>
            <input
              type="text"
              id="city"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="state">Estado</label>
            <input
              type="text"
              id="state"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="postalCode">Código Postal</label>
            <input
              type="text"
              id="postalCode"
              name="codigo_postal"
              value={formData.codigo_postal}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="country">País</label>
            <select
              id="country"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              required
            >
              <option value="México">México</option>
              {/* Add other countries if needed */}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="neighborhood">Teléfono</label>
          <input
            type="text"
            id="telephone"
            name="numero_telefono"
            value={formData.numero_telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="references">Referencias</label>
          <textarea
            id="references"
            name="referencia"
            value={formData.referencia}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="deliveryInstructions">Instrucciones de Entrega</label>
          <textarea
            id="deliveryInstructions"
            name="instrucciones_entrega"
            value={formData.instrucciones_entrega}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <input
            type="checkbox"
            id="defaultAddress"
            name="orden_domicilio"
            checked={formData.orden_domicilio === 'Predeterminado'}
            onChange={handleChange}
          />
          <label htmlFor="defaultAddress">Usar como mi dirección predeterminada</label>
        </div>

        <button type="submit" className={styles.submitButton}>Guardar Dirección</button>
      </form>
    </div>
  );
};

export default AddressFormPage;
