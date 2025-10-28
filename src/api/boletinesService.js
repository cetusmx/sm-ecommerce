const API_URL = process.env.REACT_APP_API_URL;

export const postBoletin = async (email) => {
  const response = await fetch(`${API_URL}/boletines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, estatus: 'Activo' }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al suscribirse al boletín');
  }

  return response.json();
};
