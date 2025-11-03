# socios/views/auth.py

import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.hashers import check_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# --- Imports para Google Login ---
from rest_framework.decorators import api_view, permission_classes
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from socios.models import Usuario, Rol 
from socios.serializers import RegisterSerializer


class LoginView(APIView):
    """Vista para autenticación de usuarios"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        contrasena = request.data.get("contrasena")

        if not email or not contrasena:
            return Response(
                {"error": "Email y contraseña requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Email no registrado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- MEJORA AÑADIDA ---
        # Si el usuario no tiene contraseña (se registró con Google),
        # no le permitimos iniciar sesión por esta vía.
        if not usuario.contrasena:
            return Response(
                {"error": "Esta cuenta fue registrada con Google. Por favor, inicia sesión usando Google."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # --- FIN DE LA MEJORA ---

        if not check_password(contrasena, usuario.contrasena):
            return Response(
                {"error": "Contraseña incorrecta"},
                status=status.HTTP_400_BAD_REQUEST
            )

        roles = list(usuario.roles.values_list('nombre', flat=True))
        payload = {
            "id": usuario.id,
            "email": usuario.email,
            "roles": roles,
            "exp": datetime.utcnow() + timedelta(hours=2),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({
            "token": token,
            "usuario": {
                "id": usuario.id,
                "nombre": usuario.nombre,
                "apellido": usuario.apellido,
                "email": usuario.email,
                "nro_documento": usuario.nro_documento,
                "fecha_nacimiento": usuario.fecha_nacimiento,
                "sexo": usuario.sexo,
                "foto_url": usuario.foto_url,
                "qr_token": usuario.qr_token,
                "roles": roles,
            }
        })


class RegisterView(APIView):
    """Vista para registro de nuevos usuarios"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Usuario registrado correctamente."},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


# --- VISTA DE GOOGLE LOGIN (ACTUALIZADA Y COMPATIBLE) ---

@api_view(['POST'])
@permission_classes([AllowAny]) 
def google_login_view(request):
    """
    Vista para manejar el inicio de sesión con Google (Versión mejorada).
    Recibe un 'token' (el idToken de Google) desde el frontend.
    """
    
    google_token = request.data.get('token')
    if not google_token:
        return Response(
            {"error": "No se proporcionó el token de Google."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # 1. Verificar el token con los servidores de Google
        id_info = id_token.verify_oauth2_token(
            google_token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Emisor incorrecto.')

        # 2. Obtener la información del usuario desde el token
        email = id_info['email']
        nombre = id_info.get('given_name', '')
        apellido = id_info.get('family_name', '')
        foto_url = id_info.get('picture', None) 

        # 3. Obtener el Rol. Esto DEBE existir en tu BD.
        try:
            rol_socio = Rol.objects.get(nombre='socio')
        except Rol.DoesNotExist:
            return Response(
                {"error": "Error de Configuración: El rol 'socio' no existe en la base de datos."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 4. Lógica de "Get or Create"
        # Intenta obtener el usuario por email.
        # Si no existe, lo crea usando los valores en 'defaults'.
        user, created = Usuario.objects.get_or_create(
            email=email,
            defaults={
                'nombre': nombre,
                'apellido': apellido,
                'foto_url': foto_url 
            }
        )

        if created:
            # Si el usuario es nuevo, le asignamos rol y contraseña NULA
            user.contrasena = None 
            user.roles.add(rol_socio)
            user.save()
        else:
            # Si el usuario ya existía, actualizamos sus datos por si cambiaron en Google
            user.nombre = nombre
            user.apellido = apellido
            if foto_url: # Solo actualiza la foto si Google la proporciona
                user.foto_url = foto_url
            user.save()

        # 5. Generar el token JWT (Usando la MISMA lógica que tu LoginView)
        roles = list(user.roles.values_list('nombre', flat=True))
        payload = {
            "id": user.id,
            "email": user.email,
            "roles": roles,
            "exp": datetime.utcnow() + timedelta(hours=2),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # 6. Enviar la respuesta al frontend (MISMA estructura que LoginView)
        return Response({
            "token": token,
            "usuario": {
                "id": user.id,
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "nro_documento": user.nro_documento, # Será None si es nuevo
                "fecha_nacimiento": user.fecha_nacimiento, # Será None si es nuevo
                "sexo": user.sexo, # Será None si es nuevo
                "foto_url": user.foto_url,
                "qr_token": user.qr_token,
                "roles": roles,
            }
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        # Captura tokens inválidos
        print(f"Error de validación de Google: {e}")
        return Response(
            {"error": "Token de Google inválido o expirado.", "detalle": str(e)}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        # Captura errores de base de datos
        print(f"Error interno inesperado: {e}")
        return Response(
            {"error": "Ocurrió un error interno.", "detalle": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )