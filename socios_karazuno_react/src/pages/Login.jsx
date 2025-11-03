import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/User.Context.jsx";
import { FaSignInAlt } from "react-icons/fa";
import AuthLayout from "../components/Auth/AuthLayout";
import InputField from "../components/Form/InputField";
import SubmitButton from "../components/Form/SubmitButton";
import api from "../config/axiosConfig"; 

import { GoogleLogin } from "@react-oauth/google";
// jwt-decode no es estrictamente necesario si envías el token directo,
// pero es útil para depurar. Asegúrate de haberlo instalado.
// import { jwtDecode } from "jwt-decode"; 

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", contrasena: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Para el login normal
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Para el login de Google

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Iniciando sesión...");
    try {
      const response = await api.post("/socios/login/", {
        email: formData.email,
        contrasena: formData.contrasena,
      });

      const { token, usuario } = response.data;
      login(token, usuario); 

      setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
      navigate("/socios"); 
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const errorMessage =
        error.response?.data?.error || "Email o contraseña incorrectos";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setMessage("Verificando con Google...");
    
    const idToken = credentialResponse.credential;
    
    try {
      const response = await api.post("/socios/google-login/", {
        token: idToken,
      });

      const { token, usuario } = response.data;

      login(token, usuario);

      setMessage("¡Inicio de sesión con Google exitoso! Redirigiendo...");
      navigate("/socios"); 
    } catch (error) {
      console.error("Error en el login con Google:", error);
      const errorMessage =
        error.response?.data?.error || "No se pudo autenticar con Google.";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Error en el Login con Google');
    setMessage("Hubo un error al intentar iniciar sesión con Google.");
  };

  return (
    <AuthLayout
      title="Bienvenido Socio"
      subtitle="Accede a tu cuenta"
      size="md"
    >
      {message && (
        <p
          className={`text-center mb-4 p-3 rounded-lg font-medium ${
            message.includes("Error") || message.includes("error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu.correo@ejemplo.com"
          required
        />
        <InputField
          type="password"
          label="Contraseña"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Contraseña segura"
          required
        />
        <SubmitButton icon={FaSignInAlt} disabled={isLoading || isGoogleLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </SubmitButton>
      </form>

      <div className="my-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">O</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        {isGoogleLoading ? (
           <p>Cargando...</p>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/register"
          className="text-red-600 font-semibold hover:text-red-800"
        >
          Regístrate aquí
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;