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
 * Guarda el carrito de un usuario a través de la API.
 * @param {string} email - El email del usuario.
 * @param {Array} cart - El array del carrito.
 */
export const saveUserCart = async (email, cart) => {
  if (!email) return;
  try {
    // Step 1: Delete all existing cart items for the user
    await fetch(`${API_URL}/${email}`, {
      method: 'DELETE',
    });

    // Step 2: Add each item from the current cart
    for (const item of cart) {
      const itemToSave = {
        email: email,
        clave: item.clave,
        descripcion: item.descripcion || '', // Ensure description is not undefined
        cantidad: String(item.quantity), // Convert to string as per schema
        precio: item.precio,
        fecha: new Date().toISOString(), // Add current date/time
      };
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemToSave),
      });
    }
  } catch (error) {
    console.error("Error saving cart to API:", error);
  }
};
