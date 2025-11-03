# socios/views/pago.py
import mercadopago
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import json # Importa json para imprimir diccionarios de forma legible
import traceback # Para logs más detallados si es necesario

class CrearPreferenciaPagoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cuota_id = request.data.get('cuota_id')
        monto_cuota = request.data.get('monto')
        descripcion_cuota = request.data.get('descripcion')

        if not cuota_id or monto_cuota is None or not descripcion_cuota:
             print("Datos incompletos recibidos:", request.data)
             return Response({'error': 'Faltan datos necesarios (cuota_id, monto, descripcion).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            monto_float = float(monto_cuota)
        except (ValueError, TypeError):
            print(f"Monto inválido recibido: '{monto_cuota}'")
            return Response({'error': 'El monto debe ser un número válido.'}, status=status.HTTP_400_BAD_REQUEST)


        # Inicializar SDK
        try:
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        except Exception as e:
             print(f"Error al inicializar SDK de Mercado Pago: {e}")
             return Response({'error': 'Error de configuración del servicio de pago.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        preference_data = {
            "items": [
                {
                    "id": str(cuota_id), 
                    "title": str(descripcion_cuota), 
                    "quantity": 1,
                    "unit_price": monto_float, 
                    "currency_id": "ARS" 
                }
            ],
            "payer": {
                "email": getattr(request.user, 'email', None),
            },
            "back_urls": {
                "success": "http://localhost:5173/cuotasP/exitoso", 
                "failure": "http://localhost:5173/cuotasP/fallido", 
                "pending": "http://localhost:5173/cuotasP/pendiente" 
            },
            "external_reference": f"cuota_{cuota_id}_user_{request.user.id}",
        }

        if not preference_data["payer"]["email"]:
             print(f"Usuario {request.user.id} no tiene email configurado.")
             return Response({'error': 'Falta el email del usuario para el pago.'}, status=status.HTTP_400_BAD_REQUEST)


        preference_response = None 
        try:
            print("--- Enviando datos a Mercado Pago ---")
            print(json.dumps(preference_data, indent=2))

            preference_response = sdk.preference().create(preference_data)

            print("--- Respuesta COMPLETA de Mercado Pago SDK ---")
            print(json.dumps(preference_response, indent=2)) # Loguea TODO lo que responde MP

            if isinstance(preference_response, dict) and \
               "response" in preference_response and \
               isinstance(preference_response["response"], dict) and \
               "id" in preference_response["response"]:

                preference_id = preference_response["response"]["id"]
                print(f"Preferencia creada exitosamente. ID: {preference_id}")
                return Response({'preference_id': preference_id}, status=status.HTTP_201_CREATED)
            else:
                # Si no tiene la estructura esperada, es un error o respuesta inesperada de MP
                error_message = "Respuesta inesperada o error al crear preferencia en Mercado Pago."
                if isinstance(preference_response, dict) and "response" in preference_response and isinstance(preference_response["response"], dict):
                     error_message = preference_response["response"].get("message", error_message)
                print(f"ERROR: Estructura de respuesta de MP no válida o contiene error: {error_message}")
                return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST) # Devuelve 400 Bad Request

        except mercadopago.error.MPException as mp_error:
            # Captura errores específicos del SDK de MP (ej. credenciales inválidas, datos mal formados)
            print(f"!!! Error específico de Mercado Pago !!!")
            print(f"Status Code: {getattr(mp_error, 'status_code', 'N/A')}")
            print(f"Mensaje: {getattr(mp_error, 'message', str(mp_error))}")
            print(f"Causa detallada: {getattr(mp_error, 'cause', 'N/A')}")
            print(f"Respuesta recibida (si existe): {json.dumps(preference_response, indent=2) if preference_response else 'N/A'}")
            return Response(
                {'error': f"Error de Mercado Pago: {getattr(mp_error, 'message', 'Error desconocido')}"},
                status=getattr(mp_error, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
            )
        except KeyError as ke:
             # Captura si falta una clave esperada (menos probable con la verificación de arriba, pero por si acaso)
             print(f"!!! Error de Clave (KeyError) al procesar respuesta de MP: Falta la clave -> {ke}")
             print(f"Respuesta recibida: {json.dumps(preference_response, indent=2) if preference_response else 'N/A'}")
             # print(traceback.format_exc()) # Descomenta para ver el traceback completo
             return Response({'error': f"Error interno: Falta la clave '{ke}' en la respuesta del pago."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            # Captura cualquier otro error inesperado (ej. problema de red, error de tipo, etc.)
            print(f"!!! Error INESPERADO al crear preferencia MP !!!")
            print(f"Tipo de Error: {type(e).__name__}")
            print(f"Mensaje: {e}")
            print(f"Respuesta recibida (si existe): {json.dumps(preference_response, indent=2) if preference_response else 'N/A'}")
            print("--- Traceback Completo ---")
            print(traceback.format_exc()) # Imprime el traceback detallado
            return Response({'error': 'Error interno del servidor al procesar el pago.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)