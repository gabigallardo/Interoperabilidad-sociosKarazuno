// src/pages/pago/PagoPendientePage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaClock } from 'react-icons/fa';

const PagoPendientePage = () => {
  // Opcional: Leer parámetros
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const paymentId = queryParams.get('payment_id');
  // const externalReference = queryParams.get('external_reference');
  // const status = queryParams.get('status'); // ej. 'pending' o 'in_process'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center max-w-lg w-full">
        <FaClock className="text-6xl md:text-8xl text-yellow-500 mb-6 mx-auto" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Pago Pendiente ⏳
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tu pago está siendo procesado. Recibirás una confirmación cuando se complete. Puedes revisar el estado en "Mis Cuotas" más tarde.
        </p>

        {/* Opcional: Detalles */}
        {/*
        {paymentId && <p className="text-sm text-gray-500 mb-2">ID de Pago: {paymentId}</p>}
        {externalReference && <p className="text-sm text-gray-500 mb-6">Referencia: {externalReference}</p>}
        */}

        <Link
          to="/mis-cuotas"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
        >
          Ir a Mis Cuotas
        </Link>
      </div>
    </div>
  );
};

export default PagoPendientePage;