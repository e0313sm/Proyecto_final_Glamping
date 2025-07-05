import json
import os

class Glamping:
    def __init__(self, id, nombre, capacidad, precio_por_noche, caracteristicas, disponible=True):
        self.id = id
        self.nombre = nombre
        self.capacidad = capacidad
        self.precio_por_noche = precio_por_noche
        self.caracteristicas = caracteristicas
        self.disponible = disponible

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'capacidad': self.capacidad,
            'precioPorNoche': self.precio_por_noche,
            'caracteristicas': self.caracteristicas,
            'disponible': self.disponible
        }

    @staticmethod
    def from_dict(data):
        return Glamping(
            id=data.get('id'),
            nombre=data['nombre'],
            capacidad=int(data['capacidad']),
            precio_por_noche=int(data['precioPorNoche']),
            caracteristicas=data.get('caracteristicas', []),
            disponible=data.get('disponible', True)
        )


class GlampingController:
    def __init__(self):
        self.archivo = 'data/glampings.json'
        os.makedirs(os.path.dirname(self.archivo), exist_ok=True)
        if not os.path.exists(self.archivo):
            with open(self.archivo, 'w', encoding='utf-8') as f:
                json.dump([], f)

    def obtener_todos(self):
        try:
            with open(self.archivo, 'r', encoding='utf-8') as f:
                datos = json.load(f)
            return [Glamping.from_dict(d).to_dict() for d in datos]
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def buscar_por_id(self, id):
        glampings = self.obtener_todos()
        return next((g for g in glampings if g['id'] == id), None)

    def crear(self, data):
        errores = self.validar(data)
        if errores:
            return {'errores': errores}, 400

        glampings = self.obtener_todos()
        nuevo_id = max([g['id'] for g in glampings], default=0) + 1

        nuevo = Glamping(
            id=nuevo_id,
            nombre=data['nombre'],
            capacidad=int(data['capacidad']),
            precio_por_noche=int(data['precioPorNoche']),
            caracteristicas=data.get('caracteristicas', []),
            disponible=self._parse_bool(data.get('disponible', True))
        )

        glampings.append(nuevo.to_dict())
        self._guardar_glampings(glampings)
        return nuevo.to_dict()

    def actualizar(self, id, data):
        glampings = self.obtener_todos()
        index = next((i for i, g in enumerate(glampings) if g['id'] == id), None)

        if index is None:
            return {'error': 'Glamping no encontrado'}, 404

        errores = self.validar(data)
        if errores:
            return {'errores': errores}, 400

        glampings[index] = {
            'id': id,
            'nombre': data['nombre'],
            'capacidad': int(data['capacidad']),
            'precioPorNoche': int(data['precioPorNoche']),
            'caracteristicas': data.get('caracteristicas', []),
            'disponible': self._parse_bool(data.get('disponible', True))
        }

        self._guardar_glampings(glampings)
        return glampings[index]

    def eliminar(self, id):
        glampings = self.obtener_todos()
        filtrados = [g for g in glampings if g['id'] != id]

        if len(filtrados) == len(glampings):
            return {'error': 'Glamping no encontrado'}, 404

        self._guardar_glampings(filtrados)
        return {'mensaje': 'Glamping eliminado'}

    def validar(self, data):
        errores = {}
        if not data.get('nombre'):
            errores['nombre'] = 'El nombre es obligatorio'
        if not str(data.get('capacidad', '')).isdigit():
            errores['capacidad'] = 'Capacidad debe ser un número entero'
        if not str(data.get('precioPorNoche', '')).isdigit():
            errores['precioPorNoche'] = 'El precio por noche debe ser un número'
        return errores

    def _guardar_glampings(self, datos):
        with open(self.archivo, 'w', encoding='utf-8') as f:
            json.dump(datos, f, indent=4, ensure_ascii=False)

    def _parse_bool(self, value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() == 'true'
        return bool(value)
