import { useState, useEffect } from 'react';

/**
 * Hook que retrasa la actualización de un valor hasta que ha pasado un tiempo determinado sin que cambie.
 * @param {*} value El valor a "retrasar".
 * @param {number} delay El tiempo de espera en milisegundos.
 * @returns {*} El valor retrasado.
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura un temporizador para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor cambia (ej. el usuario sigue escribiendo)
    // o si el componente se desmonta.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}

export default useDebounce;
