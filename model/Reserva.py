from datetime import datetime
from Cliente import Cliente
from Glamping import Glamping

class Reserva:
    def __init__(self, id, cliente, glamping, fecha_inicio, fecha_fin, total_pagado, estado):
        self._id = id
        self._cliente = cliente
        self._glamping = glamping
        self._fecha_inicio = fecha_inicio  
        self._fecha_fin = fecha_fin        
        self._total_pagado = total_pagado
        self._estado = estado

    # Getters y Setters
    def get_id(self):
        return self._id

    def set_id(self, id):
        self._id = id

    def get_cliente(self):
        return self._cliente

    def set_cliente(self, cliente):
        self._cliente = cliente

    def get_glamping(self):
        return self._glamping

    def set_glamping(self, glamping):
        self._glamping = glamping

    def get_fecha_inicio(self):
        return self._fecha_inicio

    def set_fecha_inicio(self, fecha_inicio):
        self._fecha_inicio = fecha_inicio

    def get_fecha_fin(self):
        return self._fecha_fin

    def set_fecha_fin(self, fecha_fin):
        self._fecha_fin = fecha_fin

    def get_total_pagado(self):
        return self._total_pagado

    def set_total_pagado(self, total_pagado):
        self._total_pagado = total_pagado

    def get_estado(self):
        return self._estado

    def set_estado(self, estado):
        self._estado = estado

    def get_cliente_id(self):
        return self._cliente.get_id()

    def get_glamping_id(self):
        return self._glamping.get_id()

    # Métodos funcionales
    def calcular_duracion(self):
        inicio = datetime.strptime(self._fecha_inicio, "%Y-%m-%d")
        fin = datetime.strptime(self._fecha_fin, "%Y-%m-%d")
        return (fin - inicio).days

    def calcular_precio_total(self):
        duracion = self.calcular_duracion()
        return duracion * self._glamping.get_precio_por_noche()

    def to_dict(self):
        return {
            "id": self._id,
            "cliente_id": self.get_cliente_id(),
            "glamping_id": self.get_glamping_id(),
            "fecha_inicio": self._fecha_inicio,
            "fecha_fin": self._fecha_fin,
            "total_pagado": self._total_pagado,
            "estado": self._estado
        }
