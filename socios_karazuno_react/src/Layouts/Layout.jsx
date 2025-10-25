import React, { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation.jsx";
import { UserContext } from "../contexts/User.Context.jsx";
import { FaSignOutAlt } from "react-icons/fa";
import { Toaster } from 'react-hot-toast';

export default function Layout() { 
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
        setUser(null);
        navigate("/login");
    };

    // Lógica para mostrar navegación
    const userRoles = user?.roles || [];
    const puedeVerNavegacion = userRoles.some(rol =>
        ['socio', 'admin', 'profesor', 'dirigente', 'empleado'].includes(rol) 
    );

    return (
        <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>

            {/* Renderiza la navegación si el usuario tiene un rol permitido */}
            {puedeVerNavegacion && <Navigation />}

            {/* Contenedor principal que se ajusta si la navegación está visible */}
            <div className={`flex-1 flex flex-col ${puedeVerNavegacion ? 'ml-64' : 'ml-0'} transition-all duration-300 ease-in-out`}>
                <header className="p-4 md:p-6 bg-white text-gray-800 flex justify-between items-center shadow-md sticky top-0 z-10 border-b border-gray-100">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">
                        Hola, {user ? <span className="text-red-600">{user.nombre}</span> : "Invitado"}
                    </h1>

                    {user && (
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-full shadow-lg font-semibold hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2 text-sm md:text-base"
                            title="Cerrar sesión"
                        >
                            <FaSignOutAlt className="text-lg md:text-xl" />
                            <span>Cerrar sesión</span>
                        </button>
                    )}
                </header>

                {/* 👇 2. Usa Outlet en lugar de children */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>

                 {/* Contenedor para las notificaciones */}
                 {/* <Toaster position="bottom-right" reverseOrder={false} /> */}
            </div>
        </div>
    );
}