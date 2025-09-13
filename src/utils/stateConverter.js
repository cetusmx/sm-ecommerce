const stateMap = {
  'aguascalientes': 'AG',
  'baja california': 'BC',
  'baja california sur': 'BS',
  'campeche': 'CM',
  'chiapas': 'CS',
  'chihuahua': 'CH',
  'coahuila': 'CO',
  'colima': 'CL',
  'ciudad de mexico': 'CMX',
  'durango': 'DG',
  'guanajuato': 'GT',
  'guerrero': 'GR',
  'hidalgo': 'HG',
  'jalisco': 'JA',
  'mexico': 'EM',
  'michoacan': 'MI',
  'morelos': 'MO',
  'nayarit': 'NA',
  'nuevo leon': 'NL',
  'oaxaca': 'OA',
  'puebla': 'PU',
  'queretaro': 'QT',
  'quintana roo': 'QR',
  'san luis potosi': 'SL',
  'sinaloa': 'SI',
  'sonora': 'SO',
  'tabasco': 'TB',
  'tamaulipas': 'TM',
  'tlaxcala': 'TL',
  'veracruz': 'VE',
  'yucatan': 'YU',
  'zacatecas': 'ZA'
};

export const convertStateToCode = (stateName) => {
  if (!stateName) return '';
  // Normalize to remove accents/diacritics
  const normalizedState = stateName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return stateMap[normalizedState] || stateName; // Fallback to original name if not found
};
