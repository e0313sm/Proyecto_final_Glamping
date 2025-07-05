import json
import os
from model.Glamping import Glamping
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
            precioPorNoche=int(data['precioPorNoche']),
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
