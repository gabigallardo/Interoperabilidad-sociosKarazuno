# socios/views/soap_eventos_api.py
from django.http import JsonResponse
from django.views import View
import requests
import xml.etree.ElementTree as ET

class EventosSOAPView(View):
    def get(self, request):
        try:
            # URL del servicio SOAP
            soap_url = "http://127.0.0.1:8000/socios/soap/eventos/"

            headers = {"Content-Type": "text/xml"}
            body = """
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                              xmlns:evt="http://clubkarazuno.com/eventos">
                <soapenv:Header/>
                <soapenv:Body>
                    <evt:GetEventos/>
                </soapenv:Body>
            </soapenv:Envelope>
            """

            response = requests.post(soap_url, data=body, headers=headers)
            response.raise_for_status()

            # Parsear la respuesta XML SOAP
            eventos = []
            root = ET.fromstring(response.text)
            ns = {"soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
                  "evt": "http://clubkarazuno.com/eventos"}

            for evento in root.findall(".//evt:Evento", ns):
                titulo = evento.find("evt:titulo", ns).text
                fecha = evento.find("evt:fecha", ns).text
                lugar = evento.find("evt:lugar", ns).text
                eventos.append({
                    "titulo": titulo,
                    "fecha": fecha,
                    "lugar": lugar,
                })

            return JsonResponse(eventos, safe=False)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
