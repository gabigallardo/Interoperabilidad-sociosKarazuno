from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.views import View
from socios.models import Evento

@method_decorator(csrf_exempt, name='dispatch')
class EventoSoapView(View):
    def post(self, request, *args, **kwargs):
        from lxml import etree

        # Parsear el XML entrante
        xml_tree = etree.fromstring(request.body)
        # Inspeccionar el contenido para debuggear
        print("SOAP Request recibido:\n", request.body.decode())

        # Recuperar los eventos del modelo
        eventos = Evento.objects.all()

        # Respuesta SOAP manual
        response_xml = """<?xml version="1.0" encoding="utf-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                          xmlns:evt="http://clubkarazuno.com/eventos">
          <soapenv:Body>
            <evt:GetEventosResponse>
        """

        for evento in eventos:
            response_xml += f"""
              <evt:Evento>
                <evt:titulo>{evento.titulo}</evt:titulo>
                <evt:fecha>{evento.fecha_inicio}</evt:fecha>
                <evt:lugar>{evento.lugar}</evt:lugar>
              </evt:Evento>
            """

        response_xml += """
            </evt:GetEventosResponse>
          </soapenv:Body>
        </soapenv:Envelope>
        """

        return HttpResponse(response_xml, content_type="text/xml")
