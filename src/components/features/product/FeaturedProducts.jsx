import React from 'react';
import styles from './FeaturedProducts.module.css'; // Estilos para la cuadrícula de productos

const products = [
  { id: 1, name: "Producto Destacado 1", price: 19.99, image: "https://via.placeholder.com/300x300?text=Producto+1" },
  { id: 2, name: "Producto Destacado 2", price: 29.50, image: "https://via.placeholder.com/300x300?text=Producto+2" },
  { id: 3, name: "Producto Destacado 3", price: 5.75, image: "https://via.placeholder.com/300x300?text=Producto+3" },
  { id: 4, name: "Producto Destacado 4", price: 45.00, image: "https://via.placeholder.com/300x300?text=Producto+4" },
];

const FeaturedProducts = () => {
  const handleAddToCart = (productId) => {
    console.log(`Producto ${productId} añadido al carrito.`);
    // Lógica para actualizar el estado del carrito
    alert('Producto añadido al carrito!');
  };

  return (
    <section className={styles['featured-products']}>
      {/* <h2>Productos Destacados</h2> */}
      <div className={styles['product-grid']}>
        {products.map(product => (
          <div key={product.id} className={styles['product-card']}>
            <img src={product.image} alt={product.name} />
            <div className={styles['product-info']}>
              <h3>{product.name}</h3>
              <p className={styles['product-price']}>${product.price.toFixed(2)}</p>
              <button
                className="btn btn-primary"
                onClick={() => handleAddToCart(product.id)}
              >
                Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;