const updateAddressOrder = async ({ id, orden_domicilio }) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/orden/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orden_domicilio }),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el orden del domicilio');
  }

  return response.json();
};

export { updateAddressOrder };
