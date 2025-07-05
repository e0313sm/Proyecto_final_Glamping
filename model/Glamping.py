class Glamping:
    
    ARCHIVO = 'data/glampings.json'
    
    def __init__(self, id, nombre, capacidad, precioPorNoche, caracteristicas, disponible=True):
        self.id = id
        self.nombre = nombre
        self.capacidad = capacidad
        self.precioPorNoche = precioPorNoche
        self.caracteristicas = caracteristicas
        self.disponible = disponible
        
    def getId(self):
        return self.id
    def getNombre(self):
        return self.nombre
    def getCapacidad(self):
        return self.capacidad
    def getPrecioPorNoche(self):
        return self.precioPorNoche
    def getCaracteristicas(self):
        return self.caracteristicas
    def isDisponible(self):
        return self.disponible
    
        

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'capacidad': self.capacidad,
            'precioPorNoche': self.precioPorNoche,
            'caracteristicas': self.caracteristicas,
            'disponible': self.disponible
        }

    @staticmethod
    def from_dict(data):
        return Glamping(
            id=data.get('id'),
            nombre=data['nombre'],
            capacidad=int(data['capacidad']),
            precioPorNoche=int(data['precioPorNoche']),
            caracteristicas=data.get('caracteristicas', []),
            disponible=data.get('disponible', True)
        )
