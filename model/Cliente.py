class Cliente: 
    def __init__(self, id, nombre, email, telefono, documento):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.telefono = telefono
        self.documento = documento

   
    def getId(self):
        return self.id
    
    def setId(self, id):
        self.id = id
    
    def getNombre(self):
        return self.nombre
    
    def setNombre(self, nombre):
        self.nombre = nombre
    
    def getEmail(self):
        return self.email
    
    def setEmail(self, email):
        self.email = email
    
    def getTelefono(self):
        return self.telefono
    
    def setTelefono(self, telefono):
        self.telefono = telefono
    
    def getDocumento(self):
        return self.documento
    
    def setDocumento(self, documento):
        self.documento = documento
    
    def toJSON(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "documento": self.documento
        }

    
    def guardar(self):
        try:
            # Leer clientes del localStorage
            clientes = Cliente.obtenerClientes()
            
            # Obtener el ID más alto para asignar uno nuevo si es necesario
            maxId = max(cliente.getId() for cliente in clientes)
            
            # Si el cliente no tiene ID, asignarle uno nuevo
            if not self.id:
                self.id = maxId + 1
            
            # Verificar si el cliente ya existe para actualizarlo
            index = next((i for i, cliente in enumerate(clientes) if cliente.getId() == self.id), None)
            
            if index is not None:
                # Actualizar cliente existente
                clientes[index] = self
            else:
                # Agregar nuevo cliente
                clientes.append(self)
            
            # Convertir los clientes a formato JSON
            clientesJSON = [cliente.toJSON() for cliente in clientes]
            
            # Guardar en localStorage
            with open('clientes.json', 'w') as f:
                json.dump(clientesJSON, f)
            return True
        except Exception as e:
            print(f"Error al guardar el cliente: {e}")
            return False
        
    def obtenerClientes(self):
        try:
            with open('clientes.json', 'r') as f:
                clientes = json.load(f)
            
            return [Cliente.fromJSON(cliente) for cliente in clientes]
        except Exception as e:
            print(f"Error al obtener los clientes: {e}")
            return []
        
    def obtenerClientePorId(self, id):
        try:
            clientes = Cliente.obtenerClientes()
            return next((cliente for cliente in clientes if cliente.getId() == id), None)
        except Exception as e:
            print(f"Error al obtener el cliente por ID: {e}")
            return None
        
    def fromJSON(self, json):
        return Cliente(
            json["id"],
            json["nombre"],
            json["email"],
            json["telefono"],
            json["documento"]
        )