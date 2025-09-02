import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
    }
    setLoading(false);
  };

  return (
    <div className={styles['login-page-container']}>
      <div className={styles['login-main-container']}>
        <div className={styles['login-header']}>
          <img src={logo} alt="Mercado de Sellos Logo" />
          <h4>Mercado de sellos</h4>
        </div>

        <div className={styles['login-form-container']}>
          <h5>Iniciar sesión</h5>
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

            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className={styles['login-legal-notice']}>
          Al ingresar, aceptas las condiciones de uso y el aviso de privacidad de Mercado de Sellos.
        </p>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>¿Eres nuevo en Mercado de Sellos?</p>
          <Link to="/signup">Crea tu cuenta</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
