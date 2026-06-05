/**
 * Realiza una llamada a la API de Gemini con lógica de reintentos y retraso exponencial (Exponential Backoff).
 * @param {Function} apiCallFn Función asíncrona que envuelve la llamada a la API de Gemini.
 * @param {number} retries Número máximo de intentos.
 * @param {number} delay Retraso inicial en milisegundos.
 * @returns {Promise<any>}
 */
export async function callGeminiWithRetry(apiCallFn, retries = 3, delay = 1000) {
  try {
    return await apiCallFn();
  } catch (error) {
    // Detectar errores de límite de cuota (HTTP 429 o menciones en el cuerpo de error)
    const isRateLimit =
      error.status === 429 ||
      (error.message && (
        error.message.includes('429') ||
        error.message.toLowerCase().includes('quota') ||
        error.message.toLowerCase().includes('rate limit') ||
        error.message.toLowerCase().includes('too many requests')
      ));

    // Si el error indica límite de cuota 0 o problemas de plan/facturación, los reintentos son inútiles
    const isZeroLimit = error.message && (
      error.message.includes('limit: 0') ||
      error.message.toLowerCase().includes('exceeded your current quota') ||
      error.message.toLowerCase().includes('billing details')
    );

    if (isRateLimit && retries > 0 && !isZeroLimit) {
      console.warn(`[Gemini API] Error de cuota (429) detectado. Esperando ${delay}ms para reintentar... (Quedan ${retries} intentos)`);
      // Bounded wait
      await new Promise((resolve) => setTimeout(resolve, delay));
      // Reintentar duplicando el tiempo de espera
      return callGeminiWithRetry(apiCallFn, retries - 1, delay * 2);
    }

    // Si no es un error de cuota, es un límite permanente o agotamos los intentos, lanzamos el error
    throw error;
  }
}
