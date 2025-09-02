import React, { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './CarouselCategorias.module.css';
import sellos from '@/assets/sellos.png';
import herramientas from '@/assets/herramientas.png';
import accesorios from '@/assets/accesorios.png';
import cilindros from '@/assets/cilindros.png';
import cnc from '@/assets/cnc.png';
import tyb from '@/assets/tyb.png';
import bombas from '@/assets/bombas.png';
import segyper from '@/assets/segyper.png';
import ofertas from '@/assets/ofertas.png';
import _3d from '@/assets/3d.png';

const categories = [
  { name: 'Sellos', image: sellos },
  { name: 'Herramientas', image: herramientas },
  { name: 'Accesorios Hidráulicos', image: accesorios },
  { name: 'Cilindros', image: cilindros },
  { name: 'Fabricación Sellos', image: cnc },
  { name: 'Tubo Honeado y Barra cromada', image: tyb },
  { name: 'Bombas Hidráulicas', image: bombas },
  { name: 'Seguros y pernos', image: segyper },
  { name: 'Ofertas Especiales', image: ofertas },
  { name: 'Impresión 3D', image: _3d },
];

const CarouselCategorias = () => {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.offsetWidth * 0.8;
      containerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
    <div className={styles['titulo-all-categories']}>
      <h4>Categorías de Productos</h4>
    </div>
    <div className={styles['category-carousel-wrapper']}>
      <button className={`${styles['carousel-arrow']} ${styles.left}`} onClick={() => scroll(-1)}>
        <FaChevronLeft />
      </button>
      <div className={styles['carousel-container']} ref={containerRef}>
        {categories.map((category, index) => (
          <div className={styles['category-card']} key={index}>
            <img src={category.image} alt={category.name} />
            <p>{category.name}</p>
          </div>
        ))}
      </div>
      <button className={`${styles['carousel-arrow']} ${styles.right}`} onClick={() => scroll(1)}>
        <FaChevronRight />
      </button>
    </div>
        </>
  );
};

export default CarouselCategorias;