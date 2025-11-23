const API_URL = process.env.REACT_APP_API_URL;

export const searchOrderForFacturacion = async (folio, total) => {
  try {
    const response = await fetch(`${API_URL}/pedidos/${folio}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, orderFound: false }; // Order not found
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Error al buscar el pedido: ${response.status}`);
    }

    const pedidoItems = await response.json();

    if (!pedidoItems || pedidoItems.length === 0) {
      return { success: true, orderFound: false }; // No items for this folio
    }

    // Debugging logs

    const orderTotal = parseFloat(pedidoItems[0].total_pedido);
    const userTotal = parseFloat(total);

    // Debugging logs

    if (isNaN(orderTotal) || isNaN(userTotal)) {
      throw new Error('El total del pedido o el total ingresado no son números válidos.');
    }

    if (orderTotal.toFixed(2) === userTotal.toFixed(2)) {
      return { success: true, orderFound: true, folio: folio };
    } else {
      return { success: true, orderFound: false }; // Total mismatch
    }
  } catch (error) {
    console.error('Error en searchOrderForFacturacion:', error);
    throw error; // Re-throw to be caught by useMutation's onError
  }
};


export const sendFacturacionDocument = async (folio, file, total, email) => {
  const formData = new FormData();
  formData.append('folio', folio);
  formData.append('monto', total);
  formData.append('pdfFile', file);
  formData.append('email', email); // Añadir el email al FormData

  try {
    const response = await fetch(`${API_URL}/facturacion/enviaconstancia`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error al enviar el documento: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en sendFacturacionDocument:', error);
    throw error;
  }
};
