import { v4 as uuidv4 } from 'uuid';

export const gestionPedidoEnAlmacen = async ({ tipoLogistica, pedidoItems, folio, shippingAddress }) => {

  if (!pedidoItems || pedidoItems.length === 0) {
    console.error("gestiónPedidoEnAlmacen fue llamado sin items de pedido.");
    return { error: true, message: "No se proporcionaron items para procesar." };
  }

  // 1. Obtener existencias y procesar datos
  const claves = pedidoItems.map(item => item.clave);
  let existenciasData;
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/existencias-masiva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claves }),
    });
    if (!response.ok) throw new Error(`Error al obtener existencias: ${response.statusText}`);
    existenciasData = await response.json();
  } catch (error) {
    console.error("Error en la llamada a existencias-masiva:", error);
    return { error: true, message: error.message };
  }

  const stockMap = new Map();
  existenciasData.forEach(p => {
    const almacenMap = new Map();
    if (p.existencias_por_almacen) {
      p.existencias_por_almacen.forEach(ex => almacenMap.set(ex.almacen, parseFloat(ex.existencia)));
    }
    stockMap.set(p.clave, almacenMap);
  });

  // 2. Definir funciones auxiliares
  const crearYEnviarRegistroDeEnvio = async (almacen, items) => {
    //console.log('Datos que llegan a crearYEnviarRegistroDeEnvio (items):', items); // Added console.log
    if (!items || items.length === 0) return;
    const folioEnvio = `ENV-${uuidv4().substring(0, 8).toUpperCase()}`;
    const envioParaGuardar = {
      folio: folioEnvio,
      folio_pedido: folio,
      almacen_asignado: almacen,
      estado_envio: 'Pendiente de surtido',
      tipo_logistica: tipoLogistica,
      destino: shippingAddress,
      items_envio: items.map(item => ({ 
        clave: item.clave, 
        cantidad: item.cantidad, 
        descripcion: item.descripcion,
        unidad: item.unidad_salida,
        cant_por_empaque: item.cant_por_empaque,
        perfil: item.perfil || null,
        existencia: item.existencia || 0
      })),
    };
    try {
      const responseEnvio = await fetch(`${process.env.REACT_APP_API_URL}/envios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envioParaGuardar),
      });
      if (!responseEnvio.ok) throw new Error(`El endpoint /envios respondió con un error: ${responseEnvio.statusText}`);
      const responseSurtir = await fetch(`${process.env.REACT_APP_API_URL}/envios/surtir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envioParaGuardar),
      });
      if (!responseSurtir.ok) throw new Error(`El endpoint /envios/surtir respondió con un error: ${responseSurtir.statusText}`);
    } catch (error) {
      console.error(`Error en el proceso de envío para el Almacén ${almacen}:`, error);
    }
  };

  // 3. Nueva Lógica de Asignación Secuencial y Sin División
  const almacenesPrioridad = ['7', '1', '6', '5'];

  const puedeSurtirCompleto = (almacenId) => {
    for (const item of pedidoItems) {
      const stockDisponible = stockMap.get(item.clave)?.get(almacenId) || 0;
      if (stockDisponible < item.cantidad) {
        return false; // Este almacén no puede surtir este item, por lo tanto no puede surtir el pedido completo
      }
    }
    return true; // Si el bucle termina, el almacén puede surtir todos los items
  };

  // Iterar sobre la lista de prioridad para encontrar un almacén que pueda surtir todo
  for (const almacenId of almacenesPrioridad) {
    if (puedeSurtirCompleto(almacenId)) {
      //console.log(`Pedido completo asignado al Almacén ${almacenId} por tener stock suficiente.`);
      await crearYEnviarRegistroDeEnvio(almacenId, pedidoItems);
      return { success: true };
    }
  }

  // Si el bucle termina, significa que ningún almacén pudo surtir el pedido completo.
  // Se aplica la regla final: asignar todo al Almacén 7.
  console.log(`Ningún almacén pudo surtir el pedido completo. Asignando por defecto al Almacén 7 para resurtido.`);
  await crearYEnviarRegistroDeEnvio('7', pedidoItems);

  return { success: true };
};
