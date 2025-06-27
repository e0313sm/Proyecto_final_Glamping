import re
import json

class Cliente:
    def __init__(self, id=None, nombre=None, email=None, telefono=None, documento=None):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.telefono = telefono
        self.documento = documento
    
    def guardar(self):
        """Guarda el cliente en el almacenamiento"""
        clientes = Cliente.obtener_clientes()
        if self.id is None:
            # Asignar nuevo ID
            self.id = max([c.id for c in clientes], default=0) + 1
            clientes.append(self)
        else:
            # Actualizar cliente existente
            for i, cliente in enumerate(clientes):
                if cliente.id == self.id:
                    clientes[i] = self
                    break
        
        # Guardar en localStorage
        datos = [{
            'id': c.id,
            'nombre': c.nombre,
            'email': c.email,
            'telefono': c.telefono,
            'documento': c.documento
        } for c in clientes]
        
        Cliente._guardar_clientes(datos)
    
    def to_dict(self):
        """Convierte el cliente a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'email': self.email,
            'telefono': self.telefono,
            'documento': self.documento
        }
    
    @staticmethod
    def _guardar_clientes(datos):
        """Método privado para guardar clientes (simulando localStorage)"""
        with open('clientes.json', 'w') as f:
            json.dump(datos, f)
    
    @staticmethod
    def obtener_clientes():
        """Obtiene todos los clientes del almacenamiento"""
        try:
            with open('clientes.json', 'r') as f:
                datos = json.load(f)
            return [Cliente(**d) for d in datos]
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    @staticmethod
    def obtener_cliente_por_id(id):
        """Obtiene un cliente por su ID"""
        clientes = Cliente.obtener_clientes()
        for cliente in clientes:
            if cliente.id == id:
                return cliente
        return None


class ClienteController:
    def __init__(self):
        pass
    
    def obtener_todos(self):
        """Obtiene todos los clientes"""
        return Cliente.obtener_clientes()
    
    def buscar_por_id(self, id):
        """Busca un cliente por su ID"""
        return Cliente.obtener_cliente_por_id(id)
    
    def buscar_por_documento(self, documento):
        """Busca un cliente por su documento"""
        clientes = self.obtener_todos()
        for cliente in clientes:
            if cliente.documento == documento:
                return cliente
        return None
    
    def crear(self, datos_cliente):
        """Crea un nuevo cliente"""
        cliente = Cliente(
            nombre=datos_cliente.get('nombre'),
            email=datos_cliente.get('email'),
            telefono=datos_cliente.get('telefono'),
            documento=datos_cliente.get('documento')
        )
        
        # Verificar duplicado
        if self.buscar_por_documento(cliente.documento):
            raise ValueError('Ya existe un cliente con ese documento')
        
        cliente.guardar()
        return cliente
    
    def actualizar(self, id, datos_cliente):
        """Actualiza un cliente existente"""
        cliente = self.buscar_por_id(id)
        if not cliente:
            return None
        
        # Verificar documento duplicado
        nuevo_documento = datos_cliente.get('documento')
        if (nuevo_documento and 
            nuevo_documento != cliente.documento and 
            self.buscar_por_documento(nuevo_documento)):
            raise ValueError('Ya existe otro cliente con ese documento')
        
        # Actualizar campos
        if 'nombre' in datos_cliente:
            cliente.nombre = datos_cliente['nombre']
        if 'email' in datos_cliente:
            cliente.email = datos_cliente['email']
        if 'telefono' in datos_cliente:
            cliente.telefono = datos_cliente['telefono']
        if 'documento' in datos_cliente:
            cliente.documento = datos_cliente['documento']
        
        cliente.guardar()
        return cliente
    
    def eliminar(self, id):
        """Elimina un cliente"""
        cliente = self.buscar_por_id(id)
        if not cliente:
            return False
        
        # Verificar si tiene reservas (simulado)
        # En una implementación real necesitaríamos un ControladorReserva
        class Reserva:
            pass
        
        reserva_controller = ReservaController()
        reservas = reserva_controller.obtener_reservas_cliente(id)
        
        if len(reservas) > 0:
            raise ValueError(f'No se puede eliminar el cliente porque tiene {len(reservas)} reservas asociadas')
        
        # Eliminar el cliente
        clientes = self.obtener_todos()
        clientes_filtrados = [c for c in clientes if c.id != id]
        
        # Guardar lista actualizada
        datos = [c.to_dict() for c in clientes_filtrados]
        Cliente._guardar_clientes(datos)
        
        return True
    
    def validar(self, datos_cliente):
        """Valida los datos de un cliente"""
        errores = {}
        
        if not datos_cliente.get('nombre') or not datos_cliente['nombre'].strip():
            errores['nombre'] = 'El nombre es obligatorio'
        
        email = datos_cliente.get('email', '')
        if not email or not email.strip():
            errores['email'] = 'El email es obligatorio'
        elif not self.validar_formato_email(email):
            errores['email'] = 'El formato del email no es válido'
        
        if not datos_cliente.get('telefono') or not datos_cliente['telefono'].strip():
            errores['telefono'] = 'El teléfono es obligatorio'
        
        if not datos_cliente.get('documento') or not datos_cliente['documento'].strip():
            errores['documento'] = 'El documento es obligatorio'
        
        return errores
    
    @staticmethod
    def validar_formato_email(email):
        """Valida el formato de un email"""
        patron = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return re.match(patron, email) is not None


# Clase simulada para demostración (sin implementación completa)
class ReservaController:
    def __init__(self):
        pass
    
    def obtener_reservas_cliente(self, cliente_id):
        """Método simulado - en una implementación real obtendría las reservas"""
        return []  # Simulamos que no hay reservas
