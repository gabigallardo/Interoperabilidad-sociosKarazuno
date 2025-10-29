// src/pages/pago/PagoFallidoPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PagoFallidoPage = () => {
  // Opcional: Leer parámetros de la URL para dar más contexto
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const paymentId = queryParams.get('payment_id');
  // const status = queryParams.get('status'); // ej. 'rejected'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center max-w-lg w-full">
        <FaTimesCircle className="text-6xl md:text-8xl text-red-500 mb-6 mx-auto" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Pago Fallido 😥
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.
        </p>

        {/* Opcional: Mostrar detalles si son útiles */}
        {/* {paymentId && <p className="text-sm text-gray-500 mb-6">ID de Intento: {paymentId}</p>} */}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/mis-cuotas" // El usuario puede intentar pagar de nuevo desde aquí
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Intentar Pagar de Nuevo
          </Link>
          <Link
            to="/dashboard" // O a otra página principal
            className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PagoFallidoPage;