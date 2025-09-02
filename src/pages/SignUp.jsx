import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import logo from '../assets/logo.png';
import styles from './SignUp.module.css';

import { useAddClient } from '@/hooks/useAddClient';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation states
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  const { signup } = useAuth();
  const { mutate: addClientToVPS } = useAddClient();
  const navigate = useNavigate();

  useEffect(() => {
    setIsPasswordLengthValid(password.length >= 6);
    setDoPasswordsMatch(password !== '' && password === confirmPassword);
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordLengthValid) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    if (!doPasswordsMatch) {
      return setError('Las contraseñas no coinciden.');
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await signup(email, password);
      await updateProfile(userCredential.user, { displayName: displayName });

      // Separar nombre y apellido del displayName
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Después de crear el usuario en Firebase, lo registramos en el VPS
      const clientData = {
        nombre: firstName,
        apellido: lastName,
        email: email,
      };
      
      addClientToVPS(clientData);

      alert('¡Cuenta creada! Revisa tu correo para verificar la cuenta.');
      navigate('/');
    } catch (err) {
      setError('Error al crear la cuenta. El correo electrónico puede que ya esté en uso.');
    }

    setLoading(false);
  };

  return (
    <div className={styles['signup-page-container']}>
      <div className={styles['signup-main-container']}>
        <div className={styles['signup-header']}>
          <img src={logo} alt="Mercado de Sellos Logo" />
          <h4>Mercado de sellos</h4>
        </div>

        <div className={styles['signup-form-container']}>
          <h5>Crear cuenta</h5>
          <div className={styles['login-prompt']}>
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Ingresa el correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="displayName">Nombre</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nombre y apellido"
              required
            />

            <label htmlFor="password">Contraseña (al menos 6 caracteres)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className={`${styles['password-validation-message']} ${isPasswordLengthValid ? styles.valid : styles.invalid}`}>
              {isPasswordLengthValid ? 'Longitud de contraseña válida' : 'La contraseña es muy corta'}
            </p>

            <label htmlFor="confirmPassword">Vuelve a escribir la contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && (
              <p className={`${styles['password-validation-message']} ${doPasswordsMatch ? styles.valid : styles.invalid}`}>
                {doPasswordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </p>
            )}

            <button type="submit" disabled={loading || !isPasswordLengthValid || !doPasswordsMatch}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className={styles['signup-legal-notice']}>
          Al crear una cuenta, aceptas las condiciones de uso y el aviso de privacidad de Mercado de Sellos.
        </p>

      </div>
    </div>
  );
};

export default SignUp;
