const API_URL = `${process.env.REACT_APP_API_URL}/carritos`;

/**
 * Obtiene el carrito de un usuario desde la API.
 * @param {string} email - El email del usuario.
 * @returns {Promise<Array>} - El carrito del usuario o un array vacío.
 */
export const getUserCart = async (email) => {
  if (!email) return [];
  try {
    const response = await fetch(`${API_URL}/${email}`);
    if (!response.ok) {
      if (response.status === 404) {
        return []; // Devuelve un carrito vacío si no se encuentra
      }
      throw new Error('Error al obtener el carrito');
    }
    const data = await response.json();
    // La API devuelve los items directamente en un array
    return data.map(item => ({ ...item, quantity: parseInt(item.cantidad, 10) }));
  } catch (error) {
    console.error("Error fetching cart from API:", error);
    return [];
  }
};

/**
 * Guarda/sobrescribe el carrito completo de un usuario usando el nuevo endpoint PUT.
 * @param {string} email - El email del usuario.
 * @param {Array} cart - El array completo del carrito.
 */
export const saveUserCart = async (email, cart) => {
  if (!email) return;
  try {
    // Mapeamos el carrito del frontend al formato esperado por el backend
    const cartToSave = cart.map(item => ({
      clave: item.clave,
      descripcion: item.descripcion || '',
      cantidad: String(item.quantity),
      precio: item.precio,
      fecha: item.fecha || new Date().toISOString(),
    }));

    const response = await fetch(`${API_URL}/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartToSave),
    });

    if (!response.ok) {
      throw new Error('Error al guardar el carrito con PUT');
    }

  } catch (error) {
    console.error("Error saving cart to API with PUT:", error);
  }
};

/**
 * Borra explícitamente todos los items del carrito de un usuario en la BD.
 * @param {string} email - El email del usuario.
 */
export const clearCartInDB = async (email) => {
  if (!email) return;
  try {
    const response = await fetch(`${API_URL}/${email}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al borrar el carrito en la BD');
    }
  } catch (error) {
    console.error("Error clearing cart in DB:", error);
  }
};
