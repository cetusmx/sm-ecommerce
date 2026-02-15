
export const calculateArrivalDate = () => {
  const now = new Date();
  const arrival = new Date();
  const currentHour = now.getHours();

  // Si es antes de las 12 PM, llega en 48 horas, si no, en 72.
  const hoursToAdd = currentHour < 12 ? 48 : 72;
  arrival.setHours(now.getHours() + hoursToAdd);


  // Adjust for weekends. Aquí ya tengo el día según el horario, ahora checar si no es fin de semana
  const dayOfWeek = arrival.getDay();
  if (dayOfWeek === 6) { // If it's Saturday
    arrival.setDate(arrival.getDate() + 3); // Move to Monday
  } else if (dayOfWeek === 0) { // If it's Sunday
    arrival.setDate(arrival.getDate() + 1); // Move to Monday
  }

  return arrival;
};
 
export const calculateDeliveryDate = (startDate = new Date()) => {
  let deliveryDate = new Date(startDate); // Work with a mutable copy

  // --- Regla especial: Si es fin de semana, tratar como si el pedido se hiciera el lunes ---
  let adjustedStartDate = new Date(startDate); // Use a new variable for adjustment
  const startDayOfWeek = adjustedStartDate.getDay();

  if (startDayOfWeek === 6) { // Si es Sábado
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 2); // Mover a Lunes
  } else if (startDayOfWeek === 0) { // Si es Domingo
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1); // Mover a Lunes
  }
  deliveryDate = adjustedStartDate; // Update deliveryDate with the adjusted start date
  // --- Fin de la regla especial ---


  // Check if the start date is today and if the time is past the cutoff (12 PM)
  const isToday = deliveryDate.toDateString() === new Date().toDateString(); // Use the adjusted deliveryDate
  if (isToday && deliveryDate.getHours() >= 12) { // Use the adjusted deliveryDate
    deliveryDate.setDate(deliveryDate.getDate() + 1); // Start counting from tomorrow
  }

  let businessDays = 0;
  while (businessDays < 1) { // Changed from 2 to 1 business day for delivery
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
      businessDays++;
    }
  }
  return deliveryDate;
};

export const formatToSpanishDate = (date) => {
    const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return localDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
};

export const formatToShortDate = (date) => {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const formatToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Create a new Date object that represents the same date but at UTC midnight
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    const utcYear = utcDate.getUTCFullYear();
    const utcMonth = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(utcDate.getUTCDate()).padStart(2, '0');
    return `${utcYear}-${utcMonth}-${utcDay}`;
};
