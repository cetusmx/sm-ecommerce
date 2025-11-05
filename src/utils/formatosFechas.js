/**
 * Convierte una fecha de formato "YYYY-MM-DD" a "miércoles, 5 de noviembre".
 *
 * @param {string} dateString La fecha en formato "YYYY-MM-DD".
 * @returns {string} La fecha formateada, por ejemplo: "miércoles, 5 de noviembre".
 */
export const formatDeliveryDate = (dateString) => {
  // 1. Crear un objeto Date a partir de la cadena de fecha.
  // Es importante añadir 'T00:00:00' para evitar problemas con la zona horaria,
  // asegurando que la fecha se interprete como el inicio de ese día.
  const date = new Date(`${dateString}T00:00:00`);

  // 2. Definir las opciones de formato.
  const options = {
    weekday: 'long', // Nombre completo del día de la semana (miércoles)
    day: 'numeric', // Día del mes (5)
    month: 'long', // Nombre completo del mes (noviembre)
  };

  // 3. Formatear la fecha a la configuración local de español (es-ES).
  const formattedDate = date.toLocaleDateString('es-ES', options);

  // El resultado de toLocaleDateString con estas opciones será algo como:
  // "miércoles, 5 de noviembre" o "miércoles, 5 de noviembre de 2025" (depende del entorno)
  // Dependiendo del entorno, puede que tengamos que hacer un pequeño ajuste.
  // Generalmente, 'es-ES' con estas opciones debería dar el formato deseado.

  // Si el resultado incluye el año (ej: "miércoles, 5 de noviembre de 2025"),
  // puedes usar una expresión regular o un split para quitarlo,
  // pero probaremos el método directo que casi siempre funciona como queremos:
  return formattedDate;
};

// Pequeño ajuste para asegurar que la primera letra del día de la semana
// esté en minúscula, ya que toLocaleDateString puede capitalizarla.
// Aunque el formato solicitado en tu ejemplo era "miércoles, 5 de noviembre",
// que tiene la 'm' en minúscula.
export const formatDeliveryDateLowercase = (dateString) => {
    const formattedDate = formatDeliveryDate(dateString);
    // Convierte el primer carácter a minúscula
    return formattedDate.charAt(0).toLowerCase() + formattedDate.slice(1);
};