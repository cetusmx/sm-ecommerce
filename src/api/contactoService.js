export const enviarContacto = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/contacto/enviar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al enviar el formulario.' }));
    throw new Error(errorData.message || 'Error en el servidor');
  }

  return response.json();
};
