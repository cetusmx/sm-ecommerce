import { useState, useEffect } from 'react';
import { calculateArrivalDate, calculateDeliveryDate, formatToSpanishDate } from '@/utils/dateUtils';

export const useDeliveryInfo = (producto, quantity) => {
  const [deliveryInfo, setDeliveryInfo] = useState({ message: '', date: '', warning: '' });

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
        message: `Recíbelo para el`,
        date: formatToSpanishDate(finalDeliveryDate),
        warning: warningMessage,
      });
    }
    // Escenario 2: La cantidad deseada supera la existencia
    else if (requestedAmount > stock) {
      const arrivalDate = calculateArrivalDate();
      const finalDeliveryDate = calculateDeliveryDate(arrivalDate);
      warningMessage = `Actualmente tenemos ${stock} unidades. El resto llegará a nuestro almacén el ${formatToSpanishDate(arrivalDate)}. Tu pedido completo se enviará en esa fecha.`;
      setDeliveryInfo({
        message: `Recibirás tu pedido para el`,
        date: formatToSpanishDate(finalDeliveryDate),
        warning: warningMessage,
      });
    }
    // Escenario 1: Hay suficiente existencia
    else {
      const deliveryDate = calculateDeliveryDate();
      setDeliveryInfo({
        message: 'Entrega para el día',
        date: formatToSpanishDate(deliveryDate),
        warning: '',
      });
    }
  }, [quantity, producto]);

  return deliveryInfo;
};
