// src/pages/cuotasP/pagarCuotaPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { getMisCuotas } from "../../api/cuotas.api";
import PagarCuotaButton from '../../components/PagarCuotaButton'; // *** IMPORTADO ***

export default function PagarCuotaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cuota, setCuota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMercadoPago, setShowMercadoPago] = useState(false); // Estado para mostrar el botón de MP

    useEffect(() => {
        async function fetchCuota() {
            setLoading(true);
            try {
                // Idealmente, deberías tener un endpoint para obtener UNA cuota por ID
                // Usar getMisCuotas() y filtrar puede ser ineficiente si hay muchas cuotas
                const data = await getMisCuotas();
                const cuotaEncontrada = data.find(c => c.id === parseInt(id));
                setCuota(cuotaEncontrada);
            } catch (error) {
                console.error("Error fetching cuota:", error);
                // Aquí podrías añadir un toast de error
            } finally {
                setLoading(false);
            }
        }
        fetchCuota();
    }, [id]);

    const handlePagoEfectivo = () => {
        setShowMercadoPago(false); // Oculta MP si estaba visible
        alert("Por favor, acércate a la administración para realizar el pago en efectivo.");
        // Podrías redirigir o mostrar más información aquí
    };

    const handlePagoMercadoPagoClick = () => {
        // Al hacer clic en el botón de opción, mostramos el botón real de MP
        setShowMercadoPago(true);
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <p className="text-gray-500 text-center">Cargando información...</p>
            </div>
        );
    }

    if (!cuota) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <p className="text-red-600 text-center">Cuota no encontrada o ya pagada.</p>
                <button
                    onClick={() => navigate("/mis-cuotas")}
                    className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg mx-auto block"
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

    // Formatear fecha para mostrar
    const fechaVencimientoFormateada = cuota.vencimiento
        ? new Date(cuota.vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'N/A';

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
                        <span className="text-gray-800">{cuota.periodo || 'N/A'}</span>
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
                    {cuota.descuento_aplicado > 0 && (
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600">Descuento aplicado:</span>
                            <span className="text-green-600 font-bold">{cuota.descuento_aplicado}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Selecciona el método de pago</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Botón Opción Efectivo */}
                    <button
                        onClick={handlePagoEfectivo}
                        className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition ${showMercadoPago ? 'border-gray-300' : 'border-red-600 bg-red-50'}`}
                        aria-pressed={!showMercadoPago}
                    >
                        <FaMoneyBillWave className="text-6xl text-green-600 mb-3" />
                        <span className="text-xl font-bold text-gray-800">Efectivo</span>
                        <span className="text-sm text-gray-500 mt-2 text-center">
                            Paga en la administración del club
                        </span>
                    </button>

                     {/* Botón Opción Mercado Pago */}
                    <button
                        onClick={handlePagoMercadoPagoClick}
                        className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition ${showMercadoPago ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'}`}
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
                        <PagarCuotaButton
                            cuotaId={cuota.id}
                            monto={parseFloat(cuota.monto) || 0}
                            descripcion={`Cuota ${cuota.periodo || `ID ${cuota.id}`}`}
                        />
                    </div>
                )}

                <button
                    onClick={() => navigate("/mis-cuotas")}
                    className="mt-6 w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}