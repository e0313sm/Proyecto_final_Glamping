class Glamping:
    def __init__(self, id, nombre, capacidad, precioPorNoche, caracteristicas=None, disponible=True):
        self.id = id
        self.nombre = nombre
        self.capacidad = capacidad
        self.precioPorNoche = precioPorNoche
        self.caracteristicas = caracteristicas or []
        self.disponible = disponible

    # Convertir el objeto a diccionario (formato compatible con JSON y frontend)
    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "capacidad": self.capacidad,
            "precioPorNoche": self.precioPorNoche,
            "caracteristicas": self.caracteristicas,
            "disponible": self.disponible
        }

    # Crear un objeto desde un diccionario (por ejemplo, desde JSON)
    @staticmethod
    def from_dict(data):
        return Glamping(
            id=data.get("id"),
            nombre=data.get("nombre"),
            capacidad=int(data.get("capacidad", 0)),
            precioPorNoche=int(data.get("precioPorNoche", 0)),
            caracteristicas=data.get("caracteristicas", []),
            disponible=Glamping._parse_bool(data.get("disponible", True))
        )

    # Convertir string o bool a bool (true/false)
    @staticmethod
    def _parse_bool(value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() == 'true'
        return bool(value)
