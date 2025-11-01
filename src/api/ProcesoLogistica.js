import { v4 as uuidv4 } from 'uuid';

export const gestionPedidoEnAlmacen = async ({ tipoLogistica, pedidoItems, folio, shippingAddress }) => {
  console.log(`Iniciando gestión en almacén para pedido ${folio} con logística: ${tipoLogistica}`);

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
    if (!items || items.length === 0) return;
    console.log("Dentro crearYEnviarRegistroDeEnvio -> ",items)
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
        cant_por_empaque: item.cant_por_empaque
      })),
    };
    console.log(`Creando registro de envío para Almacén ${almacen}:`, envioParaGuardar);
    try {
      const responseEnvio = await fetch(`${process.env.REACT_APP_API_URL}/envios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envioParaGuardar),
      });
      if (!responseEnvio.ok) throw new Error(`El endpoint /envios respondió con un error: ${responseEnvio.statusText}`);
      console.log(`Registro de envío para Almacén ${almacen} creado exitosamente.`);
      const responseSurtir = await fetch(`${process.env.REACT_APP_API_URL}/envios/surtir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envioParaGuardar),
      });
      if (!responseSurtir.ok) throw new Error(`El endpoint /envios/surtir respondió con un error: ${responseSurtir.statusText}`);
      console.log(`Envío ${envioParaGuardar.folio} enviado a surtir exitosamente.`);
    } catch (error) {
      console.error(`Error en el proceso de envío para el Almacén ${almacen}:`, error);
    }
  };

  // 3. Lógica de Asignación por Casos

  // Segregar productos en tres grupos
  const itemsConExistencia = [];
  const itemsSinExistencia = [];
  const itemsExistenciaInsuf = [];
  for (const item of pedidoItems) {
    const stock1 = stockMap.get(item.clave)?.get('1') || 0;
    const stock6 = stockMap.get(item.clave)?.get('6') || 0;
    const totalStock = stock1 + stock6;

    if (totalStock >= item.cantidad) {
      itemsConExistencia.push(item);
    } else if (totalStock > 0) {
      itemsExistenciaInsuf.push(item);
    } else {
      itemsSinExistencia.push(item);
    }
  }

  // CASO A: El pedido es perfecto (todo tiene existencia suficiente)
  if (itemsSinExistencia.length === 0 && itemsExistenciaInsuf.length === 0) {
    console.log("Todos los items tienen existencia suficiente. Procediendo con lógica original.");
    
    // --- Lógica Original Intacta ---
    const puedeSurtirCompleto = (almacenId) => {
      for (const item of pedidoItems) {
        if ((stockMap.get(item.clave)?.get(almacenId) || 0) < item.cantidad) return false;
      }
      return true;
    };

    if (puedeSurtirCompleto('6')) {
      console.log("ASIGNACIÓN: El Almacén 6 surtirá el pedido completo.");
      await crearYEnviarRegistroDeEnvio('6', pedidoItems);
      return { success: true };
    }

    if (puedeSurtirCompleto('1')) {
      console.log("ASIGNACIÓN: El Almacén 1 surtirá el pedido completo.");
      await crearYEnviarRegistroDeEnvio('1', pedidoItems);
      return { success: true };
    }

    console.log("ASIGNACIÓN: Pedido se divide.");
    const pedidoParaAlmacen1 = [];
    const pedidoParaAlmacen6 = [];
    let esSurtible = true;

    for (const item of pedidoItems) {
      const stock1 = stockMap.get(item.clave)?.get('1') || 0;
      const stock6 = stockMap.get(item.clave)?.get('6') || 0;
      if (stock1 + stock6 < item.cantidad) {
        console.error(`ERROR DE STOCK: Insuficiente para ${item.clave}. Requerido: ${item.cantidad}, Disponible: ${stock1 + stock6}`);
        esSurtible = false;
        continue;
      }
      const surtirDe6 = Math.min(item.cantidad, stock6);
      if (surtirDe6 > 0) pedidoParaAlmacen6.push({ ...item, cantidad: surtirDe6 });
      const restante = item.cantidad - surtirDe6;
      if (restante > 0) pedidoParaAlmacen1.push({ ...item, cantidad: restante });
    }

    if (!esSurtible) {
      console.error("El pedido no puede ser surtido en su totalidad por falta de existencias.");
      return { error: true, message: "Existencias insuficientes." };
    }

    await Promise.all([
      crearYEnviarRegistroDeEnvio('1', pedidoParaAlmacen1),
      crearYEnviarRegistroDeEnvio('6', pedidoParaAlmacen6)
    ]);

    return { success: true };

  } else {
    // CASO B: El pedido tiene items con stock cero o insuficiente
    console.log("El pedido contiene items con stock cero o/y insuficiente. Aplicando lógica compleja.");

    // 1. Asignación directa de items problemáticos a Almacén 1
    let finalPedidoPara1 = [...itemsSinExistencia, ...itemsExistenciaInsuf];
    let finalPedidoPara6 = [];

    // 2. Procesar el grupo de items con existencia suficiente
    if (itemsConExistencia.length > 0) {
        const puedeSurtirConExistencia = (almacenId) => {
            for (const item of itemsConExistencia) {
                if ((stockMap.get(item.clave)?.get(almacenId) || 0) < item.cantidad) return false;
            }
            return true;
        };

        // Intenta asignar todo lo que tiene existencia al Almacén 6
        if (puedeSurtirConExistencia('6')) {
            console.log("ASIGNACIÓN: Items con existencia van a Almacén 6.");
            finalPedidoPara6.push(...itemsConExistencia);
        } 
        // Intenta asignar todo lo que tiene existencia al Almacén 1
        else if (puedeSurtirConExistencia('1')) {
            console.log("ASIGNACIÓN: Items con existencia van a Almacén 1.");
            finalPedidoPara1.push(...itemsConExistencia);
        } 
        // Divide los items con existencia entre ambos almacenes
        else {
            console.log("ASIGNACIÓN: Items con existencia se dividen.");
            for (const item of itemsConExistencia) {
                const stock6 = stockMap.get(item.clave)?.get('6') || 0;
                
                const surtirDe6 = Math.min(item.cantidad, stock6);
                if (surtirDe6 > 0) {
                    finalPedidoPara6.push({ ...item, cantidad: surtirDe6 });
                }

                const restante = item.cantidad - surtirDe6;
                if (restante > 0) {
                    finalPedidoPara1.push({ ...item, cantidad: restante });
                }
            }
        }
    }

    // 3. Creación final de envíos
    console.log("Consolidando y creando envíos finales...");
    await Promise.all([
        crearYEnviarRegistroDeEnvio('1', finalPedidoPara1),
        crearYEnviarRegistroDeEnvio('6', finalPedidoPara6)
    ]);

    return { success: true };
  }
};