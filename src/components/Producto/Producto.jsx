import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './Producto.module.css';
import StockStatus from '../features/product/StockStatus';
import MedicionSellosVideo from '../features/product/MedicionSellosVideo';
import { useCart } from '@/hooks/useCart';
import { useDeliveryInfo } from '@/hooks/useDeliveryInfo'; // Import the new hook
import Modal from '../common/Modal';

const Producto = ({ producto, imageUrl }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [addedMessage, setAddedMessage] = useState('');

    // Use the new hook to get delivery info
    const deliveryInfo = useDeliveryInfo(producto, quantity);

    // --- Mock de datos de autenticación (reemplazar con tu lógica real) ---
    const isLoggedIn = false; // Cambia a true para simular un usuario logueado
    const user = {
        domicilio: 'Calle Falsa 123, Springfield'
    };
    // ---------------------------------------------------------------------

    // Effect to handle the warning modal
    useEffect(() => {
        if (deliveryInfo.warning) {
            setModalMessage(deliveryInfo.warning);
            setIsModalOpen(true);
        }
    }, [deliveryInfo.warning]);

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

    const handleAddToCart = () => {
        addItem(producto, quantity);
        setAddedMessage(`${quantity} producto(s) agregado(s) al carrito!`);
        setTimeout(() => setAddedMessage(''), 3000); // Clear message after 3 seconds
    };

    if(producto.linea==="HER") {
        imageUrl=`/Sugeridos/${producto.clave}.jpg`
    }
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
                    <button className={styles['btn-agregar']} onClick={handleAddToCart}>Agregar al carrito</button>
                    {addedMessage && <div className={styles['added-message']}>{addedMessage}</div>}
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
