import { useMutation } from '@tanstack/react-query';
import { addClient } from '@/api/clientService';

export const useAddClient = () => {
  return useMutation({
    mutationFn: addClient,
    onSuccess: (data) => {
      // Opcional: Manejar el éxito aquí si es necesario
      console.log('Cliente registrado en el VPS exitosamente:', data);
    },
    onError: (error) => {
      // Opcional: Manejar el error aquí si es necesario
      console.error('Error al registrar el cliente en el VPS:', error);
    },
  });
};
