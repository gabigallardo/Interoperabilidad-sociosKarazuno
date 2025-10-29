// src/pages/pago/PagoExitosoPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PagoExitosoPage = () => {
  // Opcional: Leer parámetros de la URL enviados por Mercado Pago
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const paymentId = queryParams.get('payment_id');
  // const externalReference = queryParams.get('external_reference');
  // const status = queryParams.get('status'); // Debería ser 'approved'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center max-w-lg w-full">
        <FaCheckCircle className="text-6xl md:text-8xl text-green-500 mb-6 mx-auto animate-pulse" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          ¡Pago Exitoso! 🎉
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tu pago ha sido procesado correctamente. Gracias por tu pago.
        </p>

        {/* Opcional: Mostrar detalles del pago si los obtienes de la URL */}
        {/*
        {paymentId && <p className="text-sm text-gray-500 mb-2">ID de Pago: {paymentId}</p>}
        {externalReference && <p className="text-sm text-gray-500 mb-6">Referencia: {externalReference}</p>}
        */}

        <Link
          to="/mis-cuotas" // Asegúrate que esta ruta exista en tu App.jsx
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
        >
          Volver a Mis Cuotas
        </Link>
      </div>
    </div>
  );
};

export default PagoExitosoPage;