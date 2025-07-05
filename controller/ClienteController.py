import json
import re
from model.Cliente import Cliente



class ClienteController:
    def __init__(self):
        self.archivo = 'data/clientes.json'

    def obtener_todos(self):
        try:
            with open(self.archivo, 'r') as f:
                datos = json.load(f)
                return datos
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def buscar_por_id(self, id):
        clientes = self.obtener_todos()
        for cliente in clientes:
            if cliente['id'] == id:
                return cliente
        return None

    def buscar_por_documento(self, documento):
        clientes = self.obtener_todos()
        for cliente in clientes:
            if cliente['documento'] == documento:
                return cliente
        return None

    def crear(self, datos_cliente):
        errores = self.validar(datos_cliente)
        if errores:
            return {"error": errores}, 400

        clientes = self.obtener_todos()

        # Validar duplicados por documento
        if self.buscar_por_documento(datos_cliente['documento']):
            return {"error": "Ya existe un cliente con ese documento"}, 400

        nuevo_id = max([c['id'] for c in clientes], default=0) + 1
        datos_cliente['id'] = nuevo_id

        clientes.append(datos_cliente)
        self._guardar(clientes)
        return datos_cliente

    def actualizar(self, id, datos_cliente):
        clientes = self.obtener_todos()
        cliente = self.buscar_por_id(id)

        if not cliente:
            return {"error": "Cliente no encontrado"}, 404

        # Validar documento duplicado
        nuevo_documento = datos_cliente.get('documento', '')
        if nuevo_documento and nuevo_documento != cliente['documento']:
            if self.buscar_por_documento(nuevo_documento):
                return {"error": "Ya existe otro cliente con ese documento"}, 400

        # Actualizar campos
        for c in clientes:
            if c['id'] == id:
                c.update(datos_cliente)
                break

        self._guardar(clientes)
        return datos_cliente

    def eliminar(self, id):
        cliente = self.buscar_por_id(id)
        if not cliente:
            return {"error": "Cliente no encontrado"}, 404

        # Verificar si tiene reservas (real o simulado)
        reserva_controller = ReservaController()
        reservas = reserva_controller.obtener_reservas_cliente(id)
        if reservas:
            return {"error": f"No se puede eliminar el cliente, tiene {len(reservas)} reservas asociadas"}, 400

        clientes = self.obtener_todos()
        clientes = [c for c in clientes if c['id'] != id]
        self._guardar(clientes)
        return {"mensaje": "Cliente eliminado correctamente"}

    def _guardar(self, clientes):
        with open(self.archivo, 'w') as f:
            json.dump(clientes, f, indent=4)

    def validar(self, datos_cliente):
        errores = {}

        if not datos_cliente.get('nombre', '').strip():
            errores['nombre'] = 'El nombre es obligatorio'

        email = datos_cliente.get('email', '')
        if not email.strip():
            errores['email'] = 'El email es obligatorio'
        elif not self.validar_formato_email(email):
            errores['email'] = 'El formato del email no es válido'

        if not datos_cliente.get('telefono', '').strip():
            errores['telefono'] = 'El teléfono es obligatorio'

        if not datos_cliente.get('documento', '').strip():
            errores['documento'] = 'El documento es obligatorio'

        return errores

    @staticmethod
    def validar_formato_email(email):
        patron = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return re.match(patron, email) is not None
