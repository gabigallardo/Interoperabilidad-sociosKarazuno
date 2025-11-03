# socios/urls.py

from django.urls import path, include
from rest_framework import routers
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

from socios.soap.services import EventoSoapView
from .views.eventos_soap import EventosSOAPView


from socios.views import (
    LoginView, RegisterView, UsuarioViewSet, RolesViewSet,
    EventoViewSet, NivelSocioViewSet, SocioInfoViewSet,
    DisciplinaViewSet, CategoriaViewSet, CuotaViewSet
)
from socios.views.auth import google_login_view 

from .views.pago import CrearPreferenciaPagoView 

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, 'usuarios')
router.register(r'roles', RolesViewSet, 'roles')
router.register(r'eventos', EventoViewSet, 'eventos')
router.register(r'niveles-socio', NivelSocioViewSet, 'niveles-socio')
router.register(r'socios-info', SocioInfoViewSet, 'socios-info')
router.register(r'disciplinas', DisciplinaViewSet, 'disciplinas')
router.register(r'categorias', CategoriaViewSet, 'categorias')
router.register(r'cuotas', CuotaViewSet, 'cuotas')


urlpatterns = [
    path('api/v1/', include(router.urls)),

    # Endpoint que genera el esquema OpenAPI en JSON
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Documentación interactiva con Swagger
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Documentación alternativa con Redoc
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # --- RUTAS DE AUTENTICACIÓN ---
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    # --- AÑADIR ESTA LÍNEA ---
    path("google-login/", google_login_view, name="google_login"),
    # --- FIN DE LA ADICIÓN ---
    
    path('pagos/crear-preferencia/', CrearPreferenciaPagoView.as_view(), name='crear_preferencia_pago'),

    path("soap/eventos/", EventoSoapView.as_view(), name="soap_eventos"),
    path('api/eventos-soap/', EventosSOAPView.as_view(), name='eventos_soap_api'),
]