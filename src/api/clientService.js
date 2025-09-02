//const API_URL = 'https://sealmarket.net/api4/api/clientes';
const API_URL = `${process.env.REACT_APP_API_URL}/clientes`;

/**
 * ESCRITURA: Añade un nuevo cliente a la API del VPS.
 * @param {Object} clientData - Los datos del nuevo cliente.
 * @returns {Promise<Object>} Una promesa que resuelve con la respuesta de la API.
 */
export const addClient = async (clientData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });

  if (!response.ok) {
    // Intenta leer el cuerpo del error para dar más detalles
    const errorBody = await response.json().catch(() => ({ message: 'Error sin cuerpo en la respuesta' }));
    throw new Error(`Error al registrar el cliente: ${response.statusText} - ${errorBody.message}`);
  }

  return response.json();
};
