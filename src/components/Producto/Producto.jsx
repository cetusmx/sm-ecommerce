import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './Producto.module.css';
import { calculateArrivalDate, calculateDeliveryDate, formatToSpanishDate } from '../../utils/dateUtils';
import StockStatus from '../features/product/StockStatus';
import MedicionSellosVideo from '../features/product/MedicionSellosVideo';
import Modal from '../common/Modal'; // Importar el modal

const Producto = ({ producto, imageUrl }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [quantity, setQuantity] = useState(1);
    const [deliveryInfo, setDeliveryInfo] = useState({ message: '', date: '', warning: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // --- Mock de datos de autenticación (reemplazar con tu lógica real) ---
    const isLoggedIn = false; // Cambia a true para simular un usuario logueado
    const user = {
        domicilio: 'Calle Falsa 123, Springfield'
    };
    // ---------------------------------------------------------------------

    useEffect(() => {
        if (!producto) return;

        const stock = producto.existencia || 0;
        const requestedAmount = quantity * (producto.cant_por_empaque || 1);
        let warningMessage = '';

        // Escenario 3: No hay existencia inicial
        if (stock === 0) {
            const arrivalDate = calculateArrivalDate();
            const finalDeliveryDate = calculateDeliveryDate(arrivalDate);
            warningMessage = `El producto llegará a nuestro almacén el ${formatToSpanishDate(arrivalDate)}. Puedes comprarlo ahora y te lo enviaremos en cuanto llegue.`;
            setDeliveryInfo({
                message: `Producto sin stock. Cómpralo ahora y recíbelo para el`,
                date: formatToSpanishDate(finalDeliveryDate),
                warning: warningMessage
            });
            setModalMessage(warningMessage);
            setIsModalOpen(true);
        }
        // Escenario 2: La cantidad deseada supera la existencia
        else if (requestedAmount > stock) {
            const arrivalDate = calculateArrivalDate();
            const finalDeliveryDate = calculateDeliveryDate(arrivalDate);
            warningMessage = `Actualmente tenemos ${stock} unidades. El resto llegará a nuestro almacén el ${formatToSpanishDate(arrivalDate)}. Tu pedido completo se enviará en esa fecha.`;
            setDeliveryInfo({
                message: `La cantidad solicitada supera el stock. Recibirás tu pedido para el`,
                date: formatToSpanishDate(finalDeliveryDate),
                warning: warningMessage
            });
            setModalMessage(warningMessage);
            setIsModalOpen(true);
        }
        // Escenario 1: Hay suficiente existencia
        else {
            const deliveryDate = calculateDeliveryDate();
            setDeliveryInfo({
                message: 'Entrega para el día',
                date: formatToSpanishDate(deliveryDate),
                warning: ''
            });
        }

    }, [quantity, producto]);


    const handleLocationClick = () => {
        if (isLoggedIn) {
            navigate('/address-form');
        } else {
            navigate('/login', { state: { from: location } });
        }
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

    const precioPorEmpaque = (producto.precio * producto.cant_por_empaque).toFixed(2);
    const precioTotal = (precioPorEmpaque * quantity).toFixed(2);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) {
            setQuantity(value);
        }
    };

    const finalImageUrl = imageUrl || `/Sugeridos/${producto.clave}.jpg`;
    const showStockStatus = producto.existencia === 0 && producto.ultima_compra === null;


    return (
        <div className={styles['producto-container']}>
            <div className={styles['columna-1']}>
                <img src={finalImageUrl} alt={producto.descripcion} />
            </div>

            <div className={styles['columna-2']}>
                <h5 className={styles['producto-descripcion']}>{producto.descripcion}</h5>
                <div className={styles['producto-precio']}>
                    {showStockStatus ? <StockStatus /> : `$${precioPorEmpaque}`}
                </div>
                
                <div className={styles['linea-form']}>
                    <label htmlFor="cantidad">Cantidad:</label>
                    <input type="number" id="cantidad" name="cantidad" min="1" value={quantity} onChange={handleQuantityChange} />
                    <span>empaque con {producto.cant_por_empaque} {producto.unidad}</span>
                </div>

                <div className={styles['producto-detalles']}>
                {producto.observaciones2 !== '' ? (
                     <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Descripción:</span> {producto.observaciones2}</span>
                    </div>):('')}
                </div>

                <div className={styles['producto-detalles']}>
                    {producto.diam_int !== '' ? (
                    <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Diámetro interior:</span> {producto.diam_int} {producto.sistema_medicion === "std" ? "pulg." : "mm"}</span>
                    </div>):('')}
                    {producto.diam_ext !== '' ? (
                    <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Diámetro exterior:</span> {producto.diam_ext} {producto.sistema_medicion === "std" ? "pulg." : "mm"}</span>
                    </div>):('')}
                    {producto.altura !== '' ? (
                    <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Altura:</span> {producto.altura} {producto.sistema_medicion === "std" ? "pulg." : "mm"}</span>
                    </div>):('')}
                    {producto.seccion && (<div className={styles['detalle-fila']}>
                         <span><span className={styles.etiqueta}>Sección:</span> {producto.seccion} {producto.sistema_medicion === "std" ? "pulg." : "mm"}</span>
                    </div>)}
                    {producto.material !== '' ? (
                     <div className={styles['detalle-fila']}>
                        <span><span className={styles.etiqueta}>Material:</span> {producto.material}</span>
                    </div>):('')}
                    {producto.sistema_medicion !== '' ? (
                    <div className={styles['detalle-fila']}>
                         <span><span className={styles.etiqueta}>Sistema medición:</span> {producto.sistema_medicion}</span>
                    </div>):('')}
                </div>

                <div className={styles['acerca-de']}>
                    <h6>Acerca de este artículo</h6>
                    <p>{producto.observaciones}</p>
                </div>
            </div>

            <div className={styles['columna-3']}>
                <div className={styles['price-cart-container']}>
                    <div className={styles.precio}>${precioTotal}</div>
                    <p className={styles.entrega}>
                        {deliveryInfo.message} <strong>{deliveryInfo.date}</strong>.
                        {deliveryInfo.warning && <span className={styles.warning}><br/>{deliveryInfo.warning}</span>}
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

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                message={modalMessage} 
            />
        </div>
    );
};

export default Producto;
