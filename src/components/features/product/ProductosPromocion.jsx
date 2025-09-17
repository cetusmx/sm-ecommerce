import React from 'react';
import AnuncioPuntual from '../../common/AnuncioPuntual';

const ProductosPromocion = ({ className }) => {
  return (
    <aside className={className}>
      <AnuncioPuntual linea="ESTUC" slogan="¡Oferta especial!" precio="326" />
      <AnuncioPuntual linea="ESTUC2" slogan="¡Estuches de Orings!" precio="326" />
      <AnuncioPuntual linea="BAMVE" slogan="¡Últimas unidades!" precio="75.00" />
    </aside>
  );
};

export default ProductosPromocion;
