class Glamping:
    def __init__(self, id, nombre, capacidad, precioPorNoche, caracteristicas, disponible):
        self.id = id
        self.nombre = nombre
        self.capacidad = capacidad
        self.precioPorNoche = precioPorNoche
        self.caracteristicas = caracteristicas
        self.disponible = disponible

    def getId(self):
        return self.id

    def setId(self, id):
        self.id = id

    def getNombre(self):
        return self.nombre

    def setNombre(self, nombre):
        self.nombre = nombre

    def getCapacidad(self):
        return self.capacidad

    def setCapacidad(self, capacidad):
        self.capacidad = capacidad

    def getPrecioPorNoche(self):
        return self.precioPorNoche

    def setPrecioPorNoche(self, precioPorNoche):
        self.precioPorNoche = precioPorNoche

    def getCaracteristicas(self):
        return self.caracteristicas

    def setCaracteristicas(self, caracteristicas):
        self.caracteristicas = caracteristicas

    def isDisponible(self):
        return self.disponible

    def setDisponible(self, disponible):
        self.disponible = disponible

    def toJSON(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "capacidad": self.capacidad,
            "precioPorNoche": self.precioPorNoche,
            "caracteristicas": self.caracteristicas,
            "disponible": self.disponible
        }

    def guardar(self):
        """
        Guarda el glamping actual en el archivo JSON
        @returns {bool} True si el glamping se guardó correctamente, False en caso contrario
        """
        try:
            import json
            import os
            
            # Leer glampings del archivo JSON
            glampings = Glamping.obtenerGlampings()
            
            # Obtener el ID más alto para asignar uno nuevo si es necesario
            max_id = max([glamping.getId() for glamping in glampings], default=0)
            
            # Si el glamping no tiene ID, asignarle uno nuevo
            if not self.id:
                self.id = max_id + 1
            
            # Verificar si el glamping ya existe para actualizarlo
            index = next((i for i, g in enumerate(glampings) if g.getId() == self.id), -1)
            
            if index != -1:
                # Actualizar glamping existente
                glampings[index] = self
            else:
                # Agregar nuevo glamping
                glampings.append(self)
            
            # Convertir los glampings a formato JSON
            glampings_json = [glamping.toJSON() for glamping in glampings]
            
            # Guardar en archivo JSON
            file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'glampings.json')
            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(glampings_json, file, indent=4, ensure_ascii=False)
            
            return True
        except Exception as error:
            print(f'Error al guardar el glamping: {error}')
            return False

    @staticmethod
    def obtenerGlampings():
        """
        Obtiene todos los glampings del archivo JSON
        @returns {list} Lista de objetos Glamping
        """
        try:
            import json
            import os
            
            # Obtener datos del archivo JSON
            file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'glampings.json')
            
            if not os.path.exists(file_path):
                return []
            
            with open(file_path, 'r', encoding='utf-8') as file:
                glampings_json = json.load(file)
            
            # Convertir datos JSON a objetos Glamping
            glampings = []
            for glamping_json in glampings_json:
                glamping = Glamping(
                    glamping_json['id'],
                    glamping_json['nombre'],
                    glamping_json['capacidad'],
                    glamping_json['precioPorNoche'],
                    glamping_json['caracteristicas'],
                    glamping_json['disponible']
                )
                glampings.append(glamping)
            
            return glampings
        except Exception as error:
            print(f'Error al obtener los glampings: {error}')
            return []

    @staticmethod
    def obtenerGlampingPorId(id):
        """
        Obtiene un glamping por su ID
        @param {int} id - ID del glamping a buscar
        @returns {Glamping|None} El glamping encontrado o None si no existe
        """
        glampings = Glamping.obtenerGlampings()
        
        # Recorrer la lista de glampings para encontrar el que coincida con el ID
        for glamping in glampings:
            if glamping.getId() == id:
                return glamping
        
        # Si no se encuentra, retornar None
        return None

    @staticmethod
    def obtenerGlampingsDisponibles():
        """
        Obtiene los glampings disponibles
        @returns {list} Lista de objetos Glamping disponibles
        """
        glampings = Glamping.obtenerGlampings()
        return [glamping for glamping in glampings if glamping.isDisponible()]

    @staticmethod
    def fromJSON(json_data):
        """
        Crea una instancia de Glamping a partir de un objeto JSON
        @param {dict} json_data - Objeto con los datos del glamping
        @returns {Glamping} Una nueva instancia de Glamping
        """
        return Glamping(
            json_data['id'],
            json_data['nombre'],
            json_data['capacidad'],
            json_data['precioPorNoche'],
            json_data['caracteristicas'],
            json_data['disponible']
        )

    