import json
import os

class Cliente:
    ARCHIVO = 'data/clientes.json'

    def __init__(self, id, nombre, email, telefono, documento):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.telefono = telefono
        self.documento = documento

    def getId(self):
        return self.id

    def getNombre(self):
        return self.nombre

    def getEmail(self):
        return self.email

    def getTelefono(self):
        return self.telefono

    def getDocumento(self):
        return self.documento

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "documento": self.documento
        }
        
    

    def guardar(self):
        try:
            clientes = Cliente.obtener_clientes()

            if not self.id:
                self.id = max([c.getId() for c in clientes], default=0) + 1

            # Reemplazar si ya existe
            index = next((i for i, c in enumerate(clientes) if c.getId() == self.id), None)
            if index is not None:
                clientes[index] = self
            else:
                clientes.append(self)

            datos = [c.to_dict() for c in clientes]

            with open(Cliente.ARCHIVO, 'w') as f:
                json.dump(datos, f, indent=4)
            return True
        except Exception as e:
            print(f"Error al guardar el cliente: {e}")
            return False

    

    @staticmethod
    def obtener_clientes():
        if not os.path.exists(Cliente.ARCHIVO):
            return []
        try:
            with open(Cliente.ARCHIVO, 'r') as f:
                datos = json.load(f)
            return [Cliente.from_dict(d) for d in datos]
        except Exception as e:
            print(f"Error al leer archivo de clientes: {e}")
            return []

    @staticmethod
    def obtener_cliente_por_id(cliente_id):
        clientes = Cliente.obtener_clientes()
        for cliente in clientes:
            if cliente.getId() == cliente_id:
                return cliente
        return None
