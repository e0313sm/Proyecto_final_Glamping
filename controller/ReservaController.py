import json
from datetime import datetime
from controller.ClienteController import ClienteController
from controller.GlampingController import GlampingController

class ReservaController:
    def __init__(self, id=None, cliente_id=None, glamping_id=None, fecha_inicio=None, fecha_fin=None, total_pagado=0.0, estado='pendiente'):
        self.id = id
        self.cliente_id = cliente_id
        self.glamping_id = glamping_id
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.total_pagado = total_pagado
        self.estado = estado

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'glamping_id': self.glamping_id,
            'fecha_inicio': self.fecha_inicio,
            'fecha_fin': self.fecha_fin,
            'total_pagado': self.total_pagado,
            'estado': self.estado
        }

    def guardar(self):
        reservas = ReservaController.obtener_todas()
        if self.id is None:
            self.id = max([r.id for r in reservas], default=0) + 1
            reservas.append(self)
        else:
            for i, r in enumerate(reservas):
                if r.id == self.id:
                    reservas[i] = self
                    break

        datos = [r.to_dict() for r in reservas]
        ReservaController._guardar_reservas(datos)

    @staticmethod
    def _guardar_reservas(reservas):
        with open('reservas.json', 'w') as f:
            json.dump(reservas, f, indent=4)

    @classmethod
    def obtener_todas(cls):
        try:
            with open('reservas.json', 'r') as f:
                datos = json.load(f)
            return [cls(**d) for d in datos]
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    @classmethod
    def buscar_por_id(cls, id):
        for r in cls.obtener_todas():
            if r.id == id:
                return r
        return None

    @classmethod
    def obtener_reservas_cliente(cls, cliente_id):
        return [r for r in cls.obtener_todas() if r.cliente_id == cliente_id]

    @classmethod
    def obtener_reservas_glamping(cls, glamping_id):
        return [r for r in cls.obtener_todas() if r.glamping_id == glamping_id]

    @classmethod
    def obtener_reservas_por_estado(cls, estado):
        return [r for r in cls.obtener_todas() if r.estado == estado]

    @classmethod
    def crear(cls, datos):
        errores = cls.validar(datos)
        if errores:
            raise ValueError(errores)

        if not cls.verificar_disponibilidad(datos['glamping_id'], datos['fecha_inicio'], datos['fecha_fin']):
            raise ValueError('El glamping no está disponible en esas fechas')

        reserva = cls(
            cliente_id=int(datos['cliente_id']),
            glamping_id=int(datos['glamping_id']),
            fecha_inicio=datos['fecha_inicio'],
            fecha_fin=datos['fecha_fin'],
            total_pagado=float(datos.get('total_pagado', 0)),
            estado=datos.get('estado', 'pendiente')
        )
        reserva.guardar()
        return reserva

    @classmethod
    def eliminar(cls, id):
        reservas = cls.obtener_todas()
        nuevas = [r for r in reservas if r.id != id]
        datos = [r.to_dict() for r in nuevas]
        cls._guardar_reservas(datos)
        return True

    @classmethod
    def actualizar_estado(cls, id, nuevo_estado):
        reserva = cls.buscar_por_id(id)
        if not reserva:
            return None
        if nuevo_estado not in ['pendiente', 'confirmada', 'cancelada']:
            raise ValueError('Estado inválido')
        reserva.estado = nuevo_estado
        reserva.guardar()
        return reserva

    @classmethod
    def verificar_disponibilidad(cls, glamping_id, fecha_inicio, fecha_fin, excluir_id=None):
        try:
            inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return False

        if fin <= inicio:
            return False

        reservas = cls.obtener_reservas_glamping(glamping_id)
        for r in reservas:
            if r.estado == 'cancelada' or (excluir_id and r.id == excluir_id):
                continue
            r_inicio = datetime.strptime(r.fecha_inicio, '%Y-%m-%d')
            r_fin = datetime.strptime(r.fecha_fin, '%Y-%m-%d')
            if (inicio < r_fin and fin > r_inicio):
                return False
        return True

    @classmethod
    def validar(cls, datos):
        errores = {}

        if not datos.get('cliente_id'):
            errores['cliente_id'] = 'El cliente es obligatorio'
        if not datos.get('glamping_id'):
            errores['glamping_id'] = 'El glamping es obligatorio'
        if not datos.get('fecha_inicio'):
            errores['fecha_inicio'] = 'La fecha de inicio es obligatoria'
        if not datos.get('fecha_fin'):
            errores['fecha_fin'] = 'La fecha de fin es obligatoria'

        try:
            ini = datetime.strptime(datos['fecha_inicio'], '%Y-%m-%d')
            fin = datetime.strptime(datos['fecha_fin'], '%Y-%m-%d')
            if fin <= ini:
                errores['fechas'] = 'La fecha de fin debe ser posterior a la de inicio'
        except:
            errores['formato'] = 'Fechas con formato inválido (YYYY-MM-DD)'

        try:
            if 'total_pagado' in datos:
                total = float(datos['total_pagado'])
                if total < 0:
                    errores['total_pagado'] = 'Debe ser positivo'
        except:
            errores['total_pagado'] = 'Debe ser un número'

        return errores
