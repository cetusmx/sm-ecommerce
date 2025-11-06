import { calculateArrivalDate, calculateDeliveryDate, formatToSpanishDate, formatToYYYYMMDD } from '@/utils/dateUtils';

export const getDeliveryInfo = (producto, quantity) => {
  if (!producto) return { message: '', date: '', shortDate: '', warning: '' };

  const stock = producto.existencia || 0;
  // Ensure quantity is a number before multiplication
  const numericQuantity = Number(quantity) || 0;
  const requestedAmount = numericQuantity * (producto.cant_por_empaque || 1);
  let warningMessage = '';

  // Escenario 3: No hay existencia inicial
  if (stock === 0) {
    const arrivalDate = calculateArrivalDate();
    const finalDeliveryDate = calculateDeliveryDate(arrivalDate);
    warningMessage = `El producto llegará a nuestro almacén el ${formatToSpanishDate(arrivalDate)}. Puedes comprarlo ahora y te lo enviaremos en cuanto llegue.`;
    return {
      date: formatToSpanishDate(finalDeliveryDate),
      shortDate: formatToYYYYMMDD(finalDeliveryDate),
      warning: warningMessage,
    };
  }
  // Escenario 2: La cantidad deseada supera la existencia
  else if (requestedAmount > stock) {
    const arrivalDate = calculateArrivalDate();
    const finalDeliveryDate = calculateDeliveryDate(arrivalDate);
    warningMessage = `Actualmente tenemos ${Math.floor(stock / producto.cant_por_empaque)} piezas. El resto llegará a nuestro almacén el ${formatToSpanishDate(arrivalDate)}. Tu pedido completo se enviará en esa fecha.`;
    return {
      message: `Recibirás tu pedido para el`,
      date: formatToSpanishDate(finalDeliveryDate),
      shortDate: formatToYYYYMMDD(finalDeliveryDate),
      warning: warningMessage,
    };
  }
  // Escenario 1: Hay suficiente existencia
  else {
    const deliveryDate = calculateDeliveryDate();
    return {
      message: 'Entrega para el día',
      date: formatToSpanishDate(deliveryDate),
      shortDate: formatToYYYYMMDD(deliveryDate),
      warning: '',
    };
  }
};
