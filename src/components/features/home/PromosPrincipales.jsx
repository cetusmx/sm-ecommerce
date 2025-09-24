import React from 'react';
import styles from './PromosPrincipales.module.css';
import PromoPrincipal from './PromoPrincipal';

// Import images
import grasera from '@/assets/grasera.jpg';
import perno from '@/assets/perno.jpg';
import seguroInterno from '@/assets/seguro-interno.jpg';
import taponGato from '@/assets/taponGato.jpg';

import her1 from '@/assets/SET-01.png';
import her2 from '@/assets/SET-18.jpg';
import her3 from '@/assets/SET-4.jpg';
import her4 from '@/assets/SET-5.jpg';

import estu1 from '@/assets/EMON70382.jpg';
import estu2 from '@/assets/ESON70382.jpg';

import cedazo from '@/assets/cedazo.jpg';
import filtro from '@/assets/filtro.jpg';
import termometro from '@/assets/termometro.jpg';
import tapon from '@/assets/tapon.jpg';


const promosData = [
  {
    title: 'Seguros, Pernos y Graseras',
    mainImage: grasera,
    mainImageAlt: 'Fabricación de sellos',
    mainImage2: perno,
    mainImage2Alt: 'Fabricación de sellos',
    description: 'Alta precisión en el proceso de maquinado con materiales de la más alta calidad.',
    subImage1: seguroInterno,
    subImage1Alt: 'Materiales 100% calidad',
    subImage1Title: '100% calidad',
    subImage2: taponGato,
    subImage2Alt: 'Alta precisión',
    subImage2Title: 'Alta precisión',
    link: '/grupo/seguros-pernos-graseras'
  },
  {
    title: 'Herramientas',
    mainImage: her1,
    mainImageAlt: 'Promo 2',
    mainImage2: her4,
    mainImage2Alt: 'Promo 2',
    description: 'Descripción de la promo 2.',
    subImage1: her2,
    subImage1Alt: 'Sub imagen 1',
    subImage1Title: 'Título sub imagen 1',
    subImage2: her3,
    subImage2Alt: 'Sub imagen 2',
    subImage2Title: 'Título sub imagen 2',
    link: '/grupo/herramientas'
  },
  {
    title: 'Accesorios Hidráulicos',
    mainImage: cedazo,
    mainImageAlt: 'Promo 3',
    mainImage2: tapon,
    mainImage2Alt: 'Promo 3',
    description: 'Descripción de la promo 3.',
    subImage1: filtro,
    subImage1Alt: 'Sub imagen 1',
    subImage1Title: 'Título sub imagen 1',
    subImage2: termometro,
    subImage2Alt: 'Sub imagen 2',
    subImage2Title: 'Título sub imagen 2',
    link: '/grupo/accesorios-hidraulicos'
  },
  {
    title: 'Estuches de Orings',
    mainImage: estu1,
    mainImageAlt: 'Promo 4',
    mainImage2: estu2,
    mainImage2Alt: 'Promo 4',
    description: 'Descripción de la promo 4.',
    subImage1: taponGato,
    subImage1Alt: 'Sub imagen 1',
    subImage1Title: 'Título sub imagen 1',
    subImage2: estu2,
    subImage2Alt: 'Sub imagen 2',
    subImage2Title: 'Título sub imagen 2',
    link: '/grupo/estuches-orings'
  }
];

const PromosPrincipales = () => {
  return (
    <div className={styles['promo-container']}>
      {promosData.map((promo, index) => (
        <PromoPrincipal
          key={index}
          {...promo}
        />
      ))}
    </div>
  );
};

export default PromosPrincipales;