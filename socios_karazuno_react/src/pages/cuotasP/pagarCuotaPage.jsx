// src/pages/cuotasP/pagarCuotaPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
// *** IMPORTA LAS NUEVAS FUNCIONES API ***
import { getCuota, pagarCuotaEfectivo } from "../../api/cuotas.api"; 
import PagarCuotaButton from '../../components/PagarCuotaButton';
import { toast } from "react-hot-toast"; // Asegúrate de importar toast

export default function PagarCuotaPage() {
    // *** CAMBIO: Usa el nombre del parámetro definido en la ruta (ej: cuotaId) ***
    const { cuotaId } = useParams(); 
    const navigate = useNavigate();
    const [cuota, setCuota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMercadoPago, setShowMercadoPago] = useState(false); 
    const [loadingEfectivo, setLoadingEfectivo] = useState(false); // Estado para el botón de efectivo

    useEffect(() => {
        async function fetchCuota() {
            setLoading(true);
            try {
                // *** USA LA NUEVA FUNCIÓN getCuota ***
                const response = await getCuota(cuotaId); 
                setCuota(response.data); // Asume que la API devuelve el objeto cuota en 'data'
                 // Si la cuota ya está pagada, redirigir o mostrar mensaje
                 if (response.data.pagada) {
                    toast.error("Esta cuota ya ha sido pagada.");
                    navigate("/mis-cuotas"); // O mostrar un mensaje en esta página
                 }
            } catch (error) {
                console.error("Error fetching cuota:", error);
                toast.error("Error al cargar los detalles de la cuota.");
                navigate("/mis-cuotas"); // Redirige si hay error
            } finally {
                setLoading(false);
            }
        }
        // Solo busca si cuotaId tiene un valor
        if (cuotaId) {
            fetchCuota();
        } else {
            // Manejar caso donde no hay ID (opcional)
            toast.error("ID de cuota no encontrado.");
            navigate("/mis-cuotas");
        }
    // Asegúrate de incluir cuotaId y navigate en las dependencias si los usas dentro
    }, [cuotaId, navigate]); 

    // *** NUEVO MANEJADOR PARA PAGO EN EFECTIVO ***
    const handlePagoEfectivo = async () => {
        setShowMercadoPago(false); // Oculta MP si estaba visible
        setLoadingEfectivo(true);
        try {
            // Llama a la API para marcar como pagada en efectivo
            await pagarCuotaEfectivo(cuotaId);
            toast.success("Pago en efectivo registrado. Recuerda realizar el pago en administración.");
            navigate("/mis-cuotas"); // Redirige a la lista de cuotas
        } catch (error) {
            console.error("Error al registrar pago en efectivo:", error);
            // Mostrar error específico si el backend lo envía
            const errorMsg = error.response?.data?.detail || 'No se pudo registrar el pago en efectivo.';
            toast.error(errorMsg);
        } finally {
            setLoadingEfectivo(false);
        }
    };

    const handlePagoMercadoPagoClick = () => {
        setShowMercadoPago(true);
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <p className="text-gray-500 text-center">Cargando información de la cuota...</p>
            </div>
        );
    }

    // Ya no necesitas esta verificación si rediriges en el useEffect
    /* if (!cuota) { ... } */
    
     // Si cuota no se cargó por alguna razón (y no se redirigió)
     if (!cuota) {
        return (
             <div className="p-6 max-w-4xl mx-auto text-center">
                 <p className="text-red-600">No se pudo cargar la información de la cuota.</p>
                 <button
                     onClick={() => navigate("/mis-cuotas")}
                     className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg"
                 >
                     Volver a Mis Cuotas
                 </button>
             </div>
        );
     }


   // Formatear monto para mostrar
   const montoFormateado = new Intl.NumberFormat('es-AR', {
       style: 'currency',
       currency: 'ARS',
   }).format(parseFloat(cuota.monto) || 0);

   // Formatear fecha para mostrar (ajusta 'fecha_vencimiento' si es necesario)
   const fechaVencimientoFormateada = cuota.fecha_vencimiento
       ? new Date(cuota.fecha_vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
       : 'N/A';
       
    // *** Ajusta 'periodo' o 'mes'/'ano' según tu modelo ***
    const periodoTexto = cuota.periodo || `${String(cuota.mes).padStart(2, '0')}/${cuota.ano}`;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-red-700 mb-6 text-center">
                Pagar Cuota
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalle de la Cuota</h2>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Período:</span>
                        <span className="text-gray-800">{periodoTexto}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Monto:</span>
                        <span className="text-2xl font-bold text-red-700">
                           {montoFormateado}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Vencimiento:</span>
                        <span className="text-gray-800">
                           {fechaVencimientoFormateada}
                        </span>
                    </div>
                    {/* Descomenta si tienes descuento */}
                    {/* {cuota.descuento_aplicado > 0 && (
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Descuento aplicado:</span>
                            <span className="text-green-600 font-bold">{cuota.descuento_aplicado}%</span>
                        </div>
                    )} */}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Selecciona el método de pago</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Botón Opción Efectivo */}
                    <button
                        // *** LLAMA AL NUEVO MANEJADOR Y DESHABILITA MIENTRAS CARGA ***
                        onClick={handlePagoEfectivo} 
                        disabled={loadingEfectivo || showMercadoPago} // Deshabilitado si carga efectivo o si MP está activo/cargando
                        className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition ${
                            !showMercadoPago ? 'border-red-600 bg-red-50' : 'border-gray-300'
                        } ${loadingEfectivo ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-600 hover:bg-red-50'}`}
                        aria-pressed={!showMercadoPago}
                    >
                        <FaMoneyBillWave className="text-6xl text-green-600 mb-3" />
                        <span className="text-xl font-bold text-gray-800">
                            {loadingEfectivo ? 'Procesando...' : 'Efectivo'}
                        </span>
                        <span className="text-sm text-gray-500 mt-2 text-center">
                            Registrar pago y abonar en administración
                        </span>
                    </button>

                     {/* Botón Opción Mercado Pago */}
                    <button
                        onClick={handlePagoMercadoPagoClick}
                        // Deshabilita si ya se eligió efectivo o si efectivo está cargando
                        disabled={loadingEfectivo} 
                        className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition ${
                            showMercadoPago ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                        } ${loadingEfectivo ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-600 hover:bg-blue-50'}`}
                        aria-pressed={showMercadoPago}
                    >
                        <FaCreditCard className="text-6xl text-blue-600 mb-3" />
                        <span className="text-xl font-bold text-gray-800">Mercado Pago</span>
                        <span className="text-sm text-gray-500 mt-2 text-center">
                            Paga online con tarjeta o transferencia
                        </span>
                    </button>
                </div>

                {/* Área donde se mostrará el botón de Mercado Pago */}
                {showMercadoPago && (
                    <div className="mt-6 border-t pt-6">
                         <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Pagar con Mercado Pago</h3>
                         {/* Usa el componente PagarCuotaButton como ya lo tenías */}
                         <PagarCuotaButton
                             cuotaId={cuota.id}
                             monto={parseFloat(cuota.monto) || 0}
                             // *** Asegúrate que la descripción sea útil para MercadoPago ***
                             descripcion={`Cuota ${periodoTexto}`} 
                         />
                    </div>
                )}

                <button
                    onClick={() => navigate("/mis-cuotas")}
                    // Deshabilita si alguna operación de pago está en curso
                    disabled={loadingEfectivo} 
                    className={`mt-6 w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition ${loadingEfectivo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}