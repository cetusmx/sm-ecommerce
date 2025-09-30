import { useState, useEffect } from 'react';
import { getDeliveryInfo } from '@/utils/deliveryUtils';

export const useDeliveryInfo = (producto, quantity) => {
  const [deliveryInfo, setDeliveryInfo] = useState({ message: '', date: '', warning: '' });

  useEffect(() => {
    const newDeliveryInfo = getDeliveryInfo(producto, quantity);
    setDeliveryInfo(newDeliveryInfo);
  }, [quantity, producto]);

  return deliveryInfo;
};
