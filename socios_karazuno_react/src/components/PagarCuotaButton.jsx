// src/components/PagarCuotaButton.jsx
import React, { useState } from 'react';
import { Wallet } from '@mercadopago/sdk-react';
import axiosInstance from '../config/axiosConfig'; // Importa tu instancia configurada de Axios

const PagarCuotaButton = ({ cuotaId, monto, descripcion }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    setPreferenceId(null);

    try {
      // *** CORRECCIÓN AQUÍ: Añadir /api/ ***
      const response = await axiosInstance.post('/socios/pagos/crear-preferencia/', {
        cuota_id: cuotaId,
        monto: monto,
        descripcion: descripcion,
      });

      if (response.data && response.data.preference_id) {
        setPreferenceId(response.data.preference_id);
      } else {
        setError('No se pudo obtener la preferencia de pago.');
      }
    } catch (err) {
      console.error("Error al crear preferencia:", err);
      // Muestra un error más específico si está disponible, sino el genérico
      setError(err.response?.data?.error || err.response?.statusText || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!preferenceId && (
        <button
           onClick={handlePayment}
           disabled={isLoading}
           className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition duration-200 ${
               isLoading
               ? 'bg-gray-400 cursor-not-allowed'
               : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
           }`}
        >
          {isLoading ? 'Generando pago...' : 'Pagar con Mercado Pago'}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}

      {preferenceId && (
         <div className="mt-4"> {/* Añade un margen superior para el botón de MP */}
            <Wallet
              initialization={{ preferenceId: preferenceId }}
              customization={{ texts: { valueProp: 'smart_option' } }}
            />
         </div>
      )}
    </div>
  );
};

export default PagarCuotaButton;