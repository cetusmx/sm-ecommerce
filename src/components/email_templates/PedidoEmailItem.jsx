import React from 'react';

const PedidoEmailItem = ({ item }) => {
  // Asumimos que el backend proveerá la URL completa de la imagen
  const imageUrl = item.imageUrl || `https://www.sealmarket.mx/Perfiles/${item.linea}.jpg`; // Fallback por si acaso

  const styles = {
    tr: {
      borderBottom: '1px solid #ddd',
    },
    td: {
      padding: '15px 10px',
      verticalAlign: 'middle',
    },
    img: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      marginRight: '15px',
    },
    productInfo: {
      display: 'flex',
      alignItems: 'center',
    },
    description: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#2177c2',
      textDecoration: 'none',
    },
    sku: {
      fontSize: '12px',
      color: '#555',
    },
    quantity: {
      fontSize: '14px',
      textAlign: 'center',
    },
    price: {
      fontSize: '14px',
      fontWeight: 'bold',
      textAlign: 'right',
    },
  };

  return (
    <tr style={styles.tr}>
      <td style={styles.td}>
        <div style={styles.productInfo}>
          <img src={imageUrl} alt={item.descripcion} style={styles.img} />
          <div>
            <a href={`https://www.sealmarket.mx/producto/${item.clave}`} style={styles.description}>
              {item.descripcion}
            </a>
            <p style={styles.sku}>SKU: {item.clave}</p>
          </div>
        </div>
      </td>
      <td style={{ ...styles.td, ...styles.quantity }}>{item.cantidad}</td>
      <td style={{ ...styles.td, ...styles.price }}>${parseFloat(item.total_partida).toFixed(2)}</td>
    </tr>
  );
};

export default PedidoEmailItem;
