// src/pages/cuotasP/misCuotasPage.jsx
import React, { useState, useEffect, useContext } from "react";
// *** IMPORTANTE: Asegúrate que esta función devuelva response.data ***
import { getMisCuotas } from "../../api/cuotas.api"; 
import { UserContext } from "../../contexts/User.Context.jsx";
import { FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
// import PagarCuotaButton from '../../components/PagarCuotaButton'; // *** Quitamos esta importación, no se usa aquí ***

export default function MisCuotasPage() {
    const { user } = useContext(UserContext);
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCuotas() {
            setLoading(true);
            setError(null);
            try {
                // Llama a la API. getMisCuotas debe devolver el array directamente.
                const cuotasData = await getMisCuotas(); 
                
                console.log("Datos recibidos directamente de getMisCuotas:", cuotasData); 

                if (Array.isArray(cuotasData)) {
                    // Ordena usando el campo 'periodo'
                    const cuotasOrdenadas = [...cuotasData].sort((a, b) => {
                        const periodoA = a.periodo || ''; 
                        const periodoB = b.periodo || '';
                        return periodoB.localeCompare(periodoA); // Ordena de más reciente a más antiguo
                    });
                    setCuotas(cuotasOrdenadas);
                } else {
                    // Si llega aquí, es porque getMisCuotas() no devolvió un array
                    console.error("Respuesta inesperada (no es array directo):", cuotasData);
                    setError("Formato de respuesta inesperado.");
                    toast.error("Error al obtener formato de cuotas.");
                    setCuotas([]);
                }
            } catch (err) {
                 console.error("Error en fetchCuotas:", err);
                 let errorMessage = "Hubo un problema al cargar tus cuotas.";
                 if (err.response) {
                     if (err.response.status === 401 || err.response.status === 403) {
                         errorMessage = "No tienes permiso para ver esta información.";
                     } else if (err.response.status === 404) {
                         errorMessage = "No se encontró el recurso de cuotas.";
                     } else if (err.response.status === 500) {
                          errorMessage = "Error interno del servidor al obtener las cuotas.";
                     }
                 }
                 setError(errorMessage);
                 toast.error(errorMessage);
                 setCuotas([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCuotas();
    }, []); // Quitamos navigate de las dependencias, no cambia

    // *** Usamos 'pago' (booleano) y 'vencimiento' ***
    const getCuotaStatus = (vencimiento, pago) => {
        // Asumiendo que 'pago' es un booleano que indica si está pagada
        if (pago) return "pagada"; 
        if (!vencimiento) return "vigente"; // Si no hay fecha, asumimos vigente
        const hoy = new Date();
        const fechaVencimiento = new Date(vencimiento);
        fechaVencimiento.setHours(23, 59, 59, 999); 
        hoy.setHours(0, 0, 0, 0); 
        return fechaVencimiento < hoy ? "vencida" : "vigente";
    };

    if (error) {
        return (
            <div className="p-6 max-w-6xl mx-auto text-center">
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <p className="text-gray-500 text-center text-lg">Cargando cuotas...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
             <h1 className="text-3xl md:text-4xl font-extrabold text-red-700 mb-6 text-center">
                 Mis Cuotas
             </h1>

             {!loading && cuotas.length === 0 && !error && (
                 <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                     <p className="text-gray-600 text-lg">No tienes cuotas registradas.</p>
                 </div>
             )}

             {cuotas.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {cuotas.map((cuota) => {
                         // *** Usamos cuota.vencimiento y cuota.pago ***
                         const status = getCuotaStatus(cuota.vencimiento, cuota.pago); 
                         const isVencida = status === "vencida";
                         const isPagada = status === "pagada";

                         const montoFormateado = new Intl.NumberFormat('es-AR', {
                             style: 'currency',
                             currency: 'ARS',
                         }).format(parseFloat(cuota.monto) || 0);
                         
                         // *** Usamos cuota.periodo ***
                         const periodoTexto = cuota.periodo || 'N/A'; 

                         return (
                             <div
                                 key={cuota.id} 
                                 className={`p-5 rounded-xl shadow-md border ${
                                     isPagada ? "bg-gray-50 border-gray-300" : isVencida ? "bg-red-50 border-red-400" : "bg-green-50 border-green-400"
                                 } transition-shadow hover:shadow-lg flex flex-col justify-between`}
                             >
                                 <div> {/* Contenedor para la info */}
                                     <div className="flex items-center justify-between mb-3 pb-2 border-b">
                                         <h3 className={`text-lg font-bold ${isPagada ? "text-gray-600" : "text-gray-800"}`}>
                                             Período: {periodoTexto}
                                         </h3>
                                         {isPagada ? <FaCheckCircle className="text-2xl text-gray-400" title="Pagada"/> : isVencida ? <FaExclamationTriangle className="text-2xl text-red-500" title="Vencida"/> : <FaMoneyBillWave className="text-2xl text-green-500" title="Vigente"/>}
                                     </div>
                                     <div className="space-y-1.5 text-sm">
                                         <div className="flex justify-between">
                                             <span className="font-medium text-gray-500">Monto:</span>
                                             <span className={`font-bold text-lg ${isPagada ? "text-gray-500" : "text-gray-800"}`}>
                                                 {montoFormateado}
                                             </span>
                                         </div>
                                         <div className="flex justify-between">
                                             <span className="font-medium text-gray-500">Vencimiento:</span>
                                             {/* *** Usamos cuota.vencimiento *** */}
                                             <span className={isPagada ? "text-gray-500" : isVencida ? "text-red-600 font-bold" : "text-gray-700"}>
                                                 {cuota.vencimiento ? new Date(cuota.vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                             </span>
                                         </div>
                                         {/* *** Usamos cuota.descuento_aplicado si existe *** */}
                                         {cuota.descuento_aplicado > 0 && ( 
                                             <div className="flex justify-between">
                                                 <span className="font-medium text-gray-500">Descuento:</span>
                                                 <span className={`font-semibold ${isPagada ? "text-gray-500" : "text-green-600"}`}>
                                                     {cuota.descuento_aplicado}%
                                                 </span>
                                             </div>
                                         )}
                                         <div className="flex justify-between pt-1">
                                             <span className="font-medium text-gray-500">Estado:</span>
                                             <span className={`font-bold uppercase px-2 py-0.5 rounded text-xs ${isPagada ? "bg-gray-200 text-gray-600" : isVencida ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                                 {isPagada ? "Pagada" : isVencida ? "Vencida" : "Vigente"}
                                             </span>
                                         </div>
                                     </div>
                                 </div>

                                 {/* *** BOTÓN SIMPLE PARA NAVEGAR (NO PagarCuotaButton) *** */}
                                 {!isPagada && ( 
                                     <div className="mt-4"> 
                                         <button
                                             onClick={() => navigate(`/pagar-cuota/${cuota.id}`)}
                                             className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                                         >
                                             Pagar Cuota
                                         </button>
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                 </div>
             )}
        </div>
    );
}