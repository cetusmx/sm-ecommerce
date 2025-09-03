import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './Producto.module.css';

// Asumimos que tienes un hook de autenticación personalizado
// que devuelve el estado de autenticación y los datos del usuario.
// const { isLoggedIn, user } = useAuth(); 

import MedicionSellosVideo from '../features/product/MedicionSellosVideo';

const Producto = ({ producto }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- Mock de datos de autenticación (reemplazar con tu lógica real) ---
    const isLoggedIn = false; // Cambia a true para simular un usuario logueado
    const user = {
        domicilio: 'Calle Falsa 123, Springfield'
    };
    // ---------------------------------------------------------------------

    const handleLocationClick = () => {
        if (isLoggedIn) {
            // Aquí iría la lógica para que el usuario edite su domicilio.
            // Por ahora, solo navegamos a una ruta hipotética.
            navigate('/editar-domicilio');
        } else {
            // Guardamos la página actual para redirigir después del login
            navigate('/login', { state: { from: location } });
        }
    };

    const getFechaEntrega = () => {
        const hoy = new Date();
        let diasHabiles = 0;
        let fecha = new Date(hoy);

        while (diasHabiles < 2) {
            fecha.setDate(fecha.getDate() + 1);
            const diaSemana = fecha.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) { // 0 = Domingo, 6 = Sábado
                diasHabiles++;
            }
        }
        return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const getHorasParaPedido = () => {
        const ahora = new Date();
        let manana = new Date();
        manana.setDate(ahora.getDate() + 1);
        manana.setHours(13, 0, 0, 0);

        let diffMs = manana - ahora;
        let diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        let diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHrs} horas y ${diffMins} minutos`;
    };

    if (!producto) {
        return <div>Cargando producto...</div>;
    }

    const imageUrl = `/Perfiles/${producto.linea}.jpg`;

    return (
        <div className={styles['producto-container']}>
            <div className={styles['columna-1']}>
                <img src={imageUrl} alt={producto.descripcion} />
            </div>

            <div className={styles['columna-2']}>
                <h5 className={styles['producto-descripcion']}>{producto.descripcion}</h5>
                <div className={styles['producto-precio']}>${producto.precio}</div>
                
                <div className={styles['linea-form']}>
                    <label htmlFor="cantidad">Cantidad:</label>
                    <input type="number" id="cantidad" name="cantidad" min="1" defaultValue="1" />
                    <span>empaque con {producto.unidad_empaque}</span>
                </div>

                <div className={styles['producto-detalles']}>
                    <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Diámetro interior:</span> {producto.diam_int}</span>
                        <span><span className={styles.etiqueta}>Diámetro exterior:</span> {producto.diam_ext}</span>
                        <span><span className={styles.etiqueta}>Altura:</span> {producto.altura}</span>
                    </div>
                     <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Material:</span> {producto.material}</span>
                    </div>
                    <div className={styles['detalle-fila']}>
                         <span><span className={styles.etiqueta}>Sistema medición:</span> {producto.sistema_medicion}</span>
                    </div>
                </div>

                <div className={styles['acerca-de']}>
                    <h6>Acerca de este artículo</h6>
                    <p>{producto.observaciones}</p>
                </div>
            </div>

            <div className={styles['columna-3']}>
                <div className={styles['price-cart-container']}>
                    <div className={styles.precio}>${producto.precio}</div>
                    <p className={styles.entrega}>
                        Entrega para el día {getFechaEntrega()}. 
                        Realiza el pedido en {getHorasParaPedido()}.
                    </p>
                    <div className={styles.ubicacion} onClick={handleLocationClick}>
                        <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                        <span>
                            {isLoggedIn ? `Enviar a ${user.domicilio}` : 'Enviar a'}
                        </span>
                    </div>
                    <button className={styles['btn-agregar']}>Agregar al carrito</button>
                </div>
                <div className={styles['video-container']}>
                    <MedicionSellosVideo />
                </div>
            </div>
        </div>
    );
};

export default Producto;
