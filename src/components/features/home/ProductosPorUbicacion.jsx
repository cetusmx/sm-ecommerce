import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductosPorUbicacion.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const imageUrl = product.IMAGE_URL || `/Perfiles/${product.perfil}.png`; 
  return (
    <Link to={`/producto/${product.clave}`} className={styles.productCard}>
      <img src={imageUrl} alt={product.descripcion} className={styles.productImage} />
      <div className={styles.productInfo}>
        <p className={styles.productName}>{product.descripcion}</p>
      </div>
    </Link>
  );
};

const ProductGroup = ({ title, products }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.productListContainer}>
        <button className={`${styles.scrollButton} ${styles.left}`} onClick={() => scroll(-1)}>
          <FaChevronLeft />
        </button>
        <div className={styles.productList} ref={scrollContainerRef}>
          {products.slice(0, 10).map(product => (
            <ProductCard key={product.clave} product={product} />
          ))}
        </div>
        <button className={`${styles.scrollButton} ${styles.right}`} onClick={() => scroll(1)}>
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

const ProductosPorUbicacion = ({ products }) => {
  const estoperoCategorias = ["Limpiadores", "Guías desgaste", "Buffers", "Sello U"];
  const estoperoProducts = products.filter(p => 
    p.colocado_en === 'estopero' && estoperoCategorias.includes(p.categoria) && p.ultima_compra !== null && p.existencia > 0
  );
  
  // Shuffle the selected products
  for (let i = estoperoProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [estoperoProducts[i], estoperoProducts[j]] = [estoperoProducts[j], estoperoProducts[i]];
  }

  const pistonPerfiles = ["CPS", "P1800", "CTC", "H714", "H780", "K49", "K501", "MPS"];
  const pistonProducts = products.filter(p => 
    p.colocado_en === 'piston' && pistonPerfiles.includes(p.perfil) && p.ultima_compra !== null && p.existencia > 0
  );

  // Shuffle the selected products
  for (let i = pistonProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pistonProducts[i], pistonProducts[j]] = [pistonProducts[j], pistonProducts[i]];
  }

  return (
    <div className={styles.container}>
      <ProductGroup title="Para Vástago" products={estoperoProducts} />
      <ProductGroup title="Para Pistón" products={pistonProducts} />
    </div>
  );
};

export default ProductosPorUbicacion;
