import api from "../config/axiosConfig"; // Usa tu instancia de axios configurada

// Define la ruta base para las cuotas según tu estructura
const BASE_PATH = "/socios/api/v1/cuotas"; // Ajusta si tu ruta base es diferente

/**
 * Obtiene las cuotas del usuario autenticado.
 * Ya tenías esta función, solo verificamos la ruta.
 */
export const getMisCuotas = async () => {
    try {
        const response = await api.get(`${BASE_PATH}/`);
        // El interceptor en axiosConfig ya está mostrando la respuesta exitosa
        console.log("✅ Mis Cuotas obtenidas (datos crudos):", response.data); 
        // Asegúrate de devolver los datos directamente
        return response.data; 
    } catch (error) {
        console.error("❌ Error fetching mis cuotas:", error.response?.status, error.response?.data);
        // Re-lanzar el error para que el componente lo pueda capturar
        throw error; 
    }
};
/**
 * Obtiene los detalles de una cuota específica por su ID.
 * NUEVA FUNCIÓN
 */
export const getCuota = async (id) => {
    if (!id) throw new Error("Se requiere un ID para obtener la cuota.");
    try {
        const response = await api.get(`${BASE_PATH}/${id}/`);
        console.log(`✅ Cuota ${id} obtenida:`, response.data);
        return response; // Devuelve la respuesta completa para acceder a .data en el componente
    } catch (error) {
        console.error(`❌ Error fetching cuota ${id}:`, error.response?.status, error.response?.data);
        throw error;
    }
};

/**
 * Marca una cuota específica como pagada en efectivo.
 * Llama a la acción personalizada 'pagar_efectivo' en el backend.
 * NUEVA FUNCIÓN
 */
export const pagarCuotaEfectivo = async (id) => {
    if (!id) throw new Error("Se requiere un ID para registrar el pago en efectivo.");
    try {
        // Usa el método POST para la acción personalizada 'pagar_efectivo'
        const response = await api.post(`${BASE_PATH}/${id}/pagar_efectivo/`, {}); // Enviamos un cuerpo vacío si no se necesita data
        console.log(`✅ Pago en efectivo registrado para cuota ${id}:`, response.data);
        return response; // Devuelve la respuesta completa
    } catch (error) {
        console.error(`❌ Error registrando pago en efectivo para cuota ${id}:`, error.response?.status, error.response?.data);
        throw error;
    }
};


/**
 * (Opcional) Función explícita para crear la preferencia de MercadoPago.
 * Nota: Tu componente PagarCuotaButton ya hace una llamada similar. 
 * Asegúrate que la URL '/socios/pagos/crear-preferencia/' sea correcta
 * y esté configurada en tu axiosConfig si no usa el BASE_PATH.
 */
export const crearPreferenciaMercadoPago = async (cuotaId, monto, descripcion) => {
    try {
        // *** Verifica que esta URL sea la correcta en tu backend ***
        const response = await api.post('/socios/pagos/crear-preferencia/', { 
            cuota_id: cuotaId,
            monto: monto,
            descripcion: descripcion,
        });
        console.log(`✅ Preferencia MP creada para cuota ${cuotaId}:`, response.data);
        return response.data; // Devuelve los datos de la preferencia
    } catch (error) {
        console.error(`❌ Error creando preferencia MP para cuota ${cuotaId}:`, error.response?.status, error.response?.data);
        throw error;
    }
};


// --- Otras funciones que podrías necesitar (ejemplos) ---

// Crear una nueva cuota (solo admins)
export const createCuota = async (cuotaData) => {
    try {
        const response = await api.post(`${BASE_PATH}/`, cuotaData);
        console.log("✅ Cuota creada:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error creando cuota:", error.response?.status, error.response?.data);
        throw error;
    }
};

// Actualizar una cuota (solo admins)
export const updateCuota = async (id, cuotaData) => {
     if (!id) throw new Error("Se requiere un ID para actualizar la cuota.");
    try {
        const response = await api.put(`${BASE_PATH}/${id}/`, cuotaData); // o .patch
        console.log(`✅ Cuota ${id} actualizada:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error actualizando cuota ${id}:`, error.response?.status, error.response?.data);
        throw error;
    }
};

// Eliminar una cuota (solo admins)
export const deleteCuota = async (id) => {
     if (!id) throw new Error("Se requiere un ID para eliminar la cuota.");
    try {
        const response = await api.delete(`${BASE_PATH}/${id}/`);
        console.log(`✅ Cuota ${id} eliminada`);
        return response.status; // Devuelve el status code (ej. 204)
    } catch (error) {
        console.error(`❌ Error eliminando cuota ${id}:`, error.response?.status, error.response?.data);
        throw error;
    }
};