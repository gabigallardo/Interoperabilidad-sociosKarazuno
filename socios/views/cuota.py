from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action # Asegúrate que 'action' esté importado
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404

from ..models import Cuota, Usuario 
from ..serializers import CuotaSerializer 
from ..permissions import RolePermission 

class CuotaViewSet(viewsets.ModelViewSet):
    queryset = Cuota.objects.all() 
    serializer_class = CuotaSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user 
        is_admin = False
        if hasattr(user, 'roles') and user.roles.filter(nombre='admin').exists():
            is_admin = True
        
        if is_admin: 
            return Cuota.objects.all().order_by(
                'usuario__apellido', 
                'usuario__nombre',   
                '-periodo'           
            )
        return Cuota.objects.filter(
            usuario=user 
        ).order_by('-periodo') 

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [RolePermission] 
            self.required_roles = ['admin'] 
        elif self.action == 'pagar_efectivo':
             self.permission_classes = [IsAuthenticated] 
        else:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]

    @action(detail=True, methods=['post']) # Simplemente así
    def pagar_efectivo(self, request, pk=None):
        user = request.user
        is_admin = False
        if hasattr(user, 'roles') and user.roles.filter(nombre='admin').exists():
            is_admin = True

        try:
            cuota = self.get_object() 
            
            if not is_admin and cuota.usuario != user: 
                 return Response(
                     {'detail': 'No tienes permiso para modificar esta cuota.'},
                     status=status.HTTP_403_FORBIDDEN
                 )

            # Usamos 'pago' para verificar
            if cuota.pago: 
                return Response(
                    {'detail': 'Esta cuota ya ha sido pagada.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Actualizamos 'pago' y otros campos
            cuota.pago = True 
            if hasattr(cuota, 'fecha_pago'):
                 cuota.fecha_pago = timezone.now()
            if hasattr(cuota, 'metodo_pago'):
                 cuota.metodo_pago = 'Efectivo' 
            cuota.save()

            serializer = self.get_serializer(cuota)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error en pagar_efectivo para cuota {pk}: {e}") 
            return Response(
                {'detail': 'Ocurrió un error al procesar el pago.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )