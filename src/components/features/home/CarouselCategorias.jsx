import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './CarouselCategorias.module.css';
import sellos from '@/assets/sellos.png';
import herramientas from '@/assets/herramientas.png';
import accesorios from '@/assets/accesorios.png';
import cilindros from '@/assets/cilindros.png';
import cnc from '@/assets/cnc.png';
import tyb from '@/assets/tyb.png';
import bombas from '@/assets/bombas-hidraulicas.png';
import segyper from '@/assets/segyper.png';
import ofertas from '@/assets/ofertas.png';
import _3d from '@/assets/3d.png';

const categories = [
  { name: 'Herramientas', image: herramientas, path: '/grupo/herramientas' },
  { name: 'Accesorios Hidráulicos', image: accesorios, path: '/grupo/accesorios-hidraulicos' },
  /* { name: 'Cilindros', image: cilindros },
  { name: 'Fabricación Sellos', image: cnc },*/
  { name: 'Tubo Honeado y Barra cromada', image: tyb }, 
  { name: 'Bombas Hidráulicas', image: bombas, path: '/grupo/accesorios-hidraulicos?filtros=Bombas hidráulicas' },
  { name: 'Seguros y pernos', image: segyper, path: '/grupo/seguros-pernos-graseras?filtros=Seguros externos,Seguros internos,Seguros E,Perno spirol,Perno ranurado,Perno sólido' },
  { name: 'Ofertas Especiales', image: ofertas },
  /* { name: 'Impresión 3D', image: _3d }, */
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
    <div className={styles['category-carousel-container']}>
    <h3 className={styles.title}>Más Productos</h3>
    <div className={styles['category-carousel-wrapper']}>
      <button className={`${styles['carousel-arrow']} ${styles.left}`} onClick={() => scroll(-1)}>
        <FaChevronLeft />
      </button>
      <div className={styles['carousel-container']} ref={containerRef}>
        {categories.map((category, index) =>
          category.path ? (
            <Link to={category.path} key={index} className={styles.link}>
              <div className={styles['category-card']}>
                <img src={category.image} alt={category.name} />
                <p>{category.name}</p>
              </div>
            </Link>
          ) : (
            <div className={styles['category-card']} key={index}>
              <img src={category.image} alt={category.name} />
              <p>{category.name}</p>
            </div>
          )
        )}
      </div>
      <button className={`${styles['carousel-arrow']} ${styles.right}`} onClick={() => scroll(1)}>
        <FaChevronRight />
      </button>
    </div>
        </div>
  );
};

export default CarouselCategorias;