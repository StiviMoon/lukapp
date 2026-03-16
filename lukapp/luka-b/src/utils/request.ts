/**
 * Utilidades para manejar requests de Express
 */

/**
 * Obtiene un parámetro de la URL como string
 */
export const getParamAsString = (param: string | string[] | undefined): string => {
  if (!param) {
    throw new Error("Parámetro requerido no encontrado");
  }
  return Array.isArray(param) ? param[0] : param;
};

/**
 * Obtiene un query param como string opcional
 */
export const getQueryAsString = (param: string | string[] | undefined): string | undefined => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};

