
export const calculateArrivalDate = () => {
  const now = new Date();
  const arrival = new Date();
  const currentHour = now.getHours();

  // Si es antes de las 12 PM, llega en 48 horas, si no, en 72.
  const hoursToAdd = currentHour < 12 ? 48 : 72;
  arrival.setHours(now.getHours() + hoursToAdd);

  return arrival;
};

export const calculateDeliveryDate = (startDate = new Date()) => {
  let businessDays = 0;
  let deliveryDate = new Date(startDate);

  while (businessDays < 2) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
      businessDays++;
    }
  }
  return deliveryDate;
};

export const formatToSpanishDate = (date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
};

export const formatToShortDate = (date) => {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
