import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import styles from "./Producto.module.css";
import StockStatus from "../features/product/StockStatus";
import MedicionSellosVideo from "../features/product/MedicionSellosVideo";
import { useCart } from "@/hooks/useCart";
import { useDeliveryInfo } from "@/hooks/useDeliveryInfo"; // Import the new hook
import Modal from "../common/Modal";
import AddressSelectionModal from "../cart/AddressSelectionModal"; // Import AddressSelectionModal

import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation and useQueryClient
import { updateAddressOrder } from "@/api/addresses"; // Import updateAddressOrder

const Producto = ({ producto, imageUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, shippingAddress } = useCart(); // Get shippingAddress
  const { isLoggedIn } = useAuth(); // Get isLoggedIn from useAuth
  const queryClient = useQueryClient(); // Initialize queryClient
  const { currentUser } = useAuth(); // Get currentUser for query invalidation
  const userEmail = currentUser?.email; // Get userEmail for query invalidation

  const [quantity, setQuantity] = useState(1);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false); // Renamed for clarity
  const [isAddressSelectionModalOpen, setIsAddressSelectionModalOpen] =
    useState(false); // New state for address modal
  const [modalMessage, setModalMessage] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  // Use the new hook to get delivery info
  const deliveryInfo = useDeliveryInfo(producto, quantity);

  // --- Datos de autenticación y dirección de envío ---
  // Ahora se obtienen de los hooks useAuth y useCart
  // ---------------------------------------------------------------------

  // Effect to handle the warning modal
  useEffect(() => {
    if (deliveryInfo.warning) {
      setModalMessage(deliveryInfo.warning);
      setIsWarningModalOpen(true); // Use renamed state
    }
  }, [deliveryInfo.warning]);

  const updateOrderMutation = useMutation({
    mutationFn: updateAddressOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["userAddresses", userEmail]);
    },
  });

  const handleLocationClick = () => {
    if (isLoggedIn) {
      setIsAddressSelectionModalOpen(true); // Open the address selection modal
    } else {
      navigate("/login", { state: { from: location } });
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

  const precioPorEmpaque = (
    producto.precio * producto.cant_por_empaque
  ).toFixed(2);
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
    setTimeout(() => setAddedMessage(""), 3000); // Clear message after 3 seconds
  };

  if (producto.linea === "HER") {
    imageUrl = `/Sugeridos/${producto.clave}.jpg`;
  }
  const finalImageUrl = imageUrl || `/Sugeridos/${producto.clave}.jpg`;
  const showStockStatus =
    producto.existencia === 0 && producto.ultima_compra === null;

  return (
    <div className={styles["producto-container"]}>
      <div className={styles["columna-1"]}>
        <img src={finalImageUrl} alt={producto.descripcion} />
      </div>

      <div className={styles["columna-2"]}>
        <h5 className={styles["producto-descripcion"]}>
          {producto.descripcion}
        </h5>
        <h7>SKU: {producto.clave}</h7>
        <div className={styles["producto-precio"]}>
          {showStockStatus ? <StockStatus /> : `$${precioPorEmpaque}`}
        </div>

        <div className={styles["linea-form"]}>
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
          />
          <span>
            empaque con {producto.cant_por_empaque} {producto.unidad}
          </span>
        </div>

        <div className={styles["producto-detalles"]}>
          {producto.observaciones2 !== "" ? (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Descripción:</span>{" "}
                {producto.observaciones2}
              </span>
            </div>
          ) : (
            ""
          )}
        </div>

        <div className={styles["producto-detalles"]}>
          {producto.diam_int !== "" ? (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Diámetro interior:</span>{" "}
                {producto.diam_int}{" "}
                {producto.sistema_medicion === "std" ? "pulg." : "mm"}
              </span>
            </div>
          ) : (
            ""
          )}
          {producto.diam_ext !== "" ? (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Diámetro exterior:</span>{" "}
                {producto.diam_ext}{" "}
                {producto.sistema_medicion === "std" ? "pulg." : "mm"}
              </span>
            </div>
          ) : (
            ""
          )}
          {producto.altura !== "" ? (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Altura:</span>{" "}
                {producto.altura}{" "}
                {producto.sistema_medicion === "std" ? "pulg." : "mm"}
              </span>
            </div>
          ) : (
            ""
          )}
          {producto.seccion && (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Sección:</span>
                {producto.seccion}{" "}
                {producto.sistema_medicion === "std" ? "pulg." : "mm"}
              </span>
            </div>
          )}
          {producto.marca && (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Marca:</span>
                {producto.marca}{" "}
                {producto.sistema_medicion === "std" ? "pulg." : "mm"}
              </span>
            </div>
          )}
          {producto.material !== "" ? (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Material:</span>
                {producto.material}
              </span>
            </div>
          ) : (
            ""
          )}
          {producto.sistema_medicion !== "" ? (
            <div className={styles["detalle-fila"]}>
              <span>
                <span className={styles.etiqueta}>Sistema medición: <span style={{fontWeight:400}} > {producto.sistema_medicion==="std" ? "Estándar" : "Milimétrico"}</span></span>
              </span>
            </div>
          ) : (
            ""
          )}
        </div>

        <div className={styles["acerca-de"]}>
          <h6>Acerca de este artículo</h6>
          <p>{producto.observaciones}</p>
        </div>
      </div>

      <div className={styles["columna-3"]}>
        <div className={styles["price-cart-container"]}>
          <div className={styles.precio}>${precioTotal}</div>
          <p className={styles.entrega}>
            {deliveryInfo.message} <strong>{deliveryInfo.date}</strong>.
            {deliveryInfo.warning && (
              <span className={styles.warning}>
                <br />
                {deliveryInfo.warning}
              </span>
            )}
          </p>
          <div className={styles.ubicacion} onClick={handleLocationClick}>
            <FaMapMarkerAlt style={{ marginRight: "8px" }} />
            <span>
              {isLoggedIn && shippingAddress
                ? `Enviar a ${shippingAddress.ciudad}, ${shippingAddress.codigo_postal}`
                : "Enviar a"}
            </span>
          </div>
          <button className="sm-btn sm-btn-primary" onClick={handleAddToCart}>
            Agregar al carrito
          </button>
          {addedMessage && (
            <div className={styles["added-message"]}>{addedMessage}</div>
          )}
        </div>
        <div className={styles["video-container"]}>
          <MedicionSellosVideo />
        </div>
      </div>

      <Modal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
      >
        <h4>Atención</h4>
        <p>{modalMessage}</p>
        <button
          className="sm-btn sm-btn-primary"
          onClick={() => setIsWarningModalOpen(false)}
        >
          Cerrar
        </button>
      </Modal>

      <AddressSelectionModal
        isOpen={isAddressSelectionModalOpen}
        onClose={() => setIsAddressSelectionModalOpen(false)}
        onSelectAddress={async (selectedAddress) => {
          // Find the current default address to clear it
          const currentDefault = (
            await queryClient.getQueryData(["userAddresses", userEmail])
          )?.find((address) => address.orden_domicilio === "Predeterminado");

          // Clear the old default if it exists
          if (currentDefault) {
            await updateOrderMutation.mutateAsync({
              id: currentDefault.id,
              orden_domicilio: "",
            });
          }

          // Set the new address as default
          await updateOrderMutation.mutateAsync({
            id: selectedAddress.id,
            orden_domicilio: "Predeterminado",
          });

          // Close the modal after selection and update
          setIsAddressSelectionModalOpen(false);
        }}
      />
    </div>
  );
};

export default Producto;
