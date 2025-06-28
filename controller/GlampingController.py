class GlampingController:
    """
    Controlador para la gestión de glampings.
    """

    def __init__(self):
        """Constructor del controlador de glampings."""
        pass

    def obtener_todos(self):
        """Obtiene todos los glampings.

        Returns:
            list: Lista de todos los glampings.
        """
        return Glamping.obtener_glampings()

    def obtener_disponibles(self):
        """Obtiene los glampings disponibles.

        Returns:
            list: Lista de glampings disponibles.
        """
        return Glamping.obtener_glampings_disponibles()

    def buscar_por_id(self, id):
        """Busca un glamping por su ID.

        Args:
            id (int): ID del glamping.

        Returns:
            Glamping or None: Glamping encontrado o None.
        """
        return Glamping.obtener_glamping_por_id(id)

    def buscar_por_nombre(self, nombre):
        """Busca glampings por nombre (búsqueda parcial).

        Args:
            nombre (str): Nombre o parte del nombre a buscar.

        Returns:
            list: Glampings que coinciden.
        """
        nombre_busqueda = nombre.lower()
        return [g for g in self.obtener_todos() if nombre_busqueda in g.get_nombre().lower()]

    def buscar_por_capacidad(self, capacidad):
        """Busca glampings por capacidad mínima.

        Args:
            capacidad (int): Capacidad mínima.

        Returns:
            list: Glampings con capacidad igual o mayor.
        """
        return [g for g in Glamping.obtener_glampings() if g.get_capacidad() >= int(capacidad)]

    def buscar_por_rango_precio(self, precio_min, precio_max):
        """Busca glampings por rango de precio.

        Args:
            precio_min (int): Precio mínimo.
            precio_max (int): Precio máximo.

        Returns:
            list: Glampings dentro del rango.
        """
        return [g for g in Glamping.obtener_glampings()
                if int(precio_min) <= g.get_precio_por_noche() <= int(precio_max)]

    def buscar_por_caracteristica(self, caracteristica):
        """Busca glampings por característica.

        Args:
            caracteristica (str): Característica a buscar.

        Returns:
            list: Glampings que contienen la característica.
        """
        caracteristica = caracteristica.lower()
        return [g for g in Glamping.obtener_glampings()
                if any(c.lower().find(caracteristica) != -1 for c in g.get_caracteristicas())]

    def crear(self, datos_glamping):
        """Crea un nuevo glamping.

        Args:
            datos_glamping (dict): Datos del nuevo glamping.

        Returns:
            Glamping: El glamping creado.
        """
        errores = self.validar(datos_glamping)
        if errores:
            raise ValueError(errores)

        glamping = Glamping(
            id=None,
            nombre=datos_glamping['nombre'],
            capacidad=int(datos_glamping['capacidad']),
            precio_por_noche=int(datos_glamping['precio_por_noche']),
            caracteristicas=datos_glamping.get('caracteristicas', []),
            disponible=datos_glamping.get('disponible', True)
        )
        glamping.guardar()
        return glamping

    def actualizar(self, id, datos_glamping):
        """Actualiza los datos de un glamping existente.

        Args:
            id (int): ID del glamping.
            datos_glamping (dict): Nuevos datos.

        Returns:
            Glamping or None: Glamping actualizado o None.
        """
        glamping = self.buscar_por_id(id)
        if not glamping:
            return None

        errores = self.validar(datos_glamping)
        if errores:
            raise ValueError(errores)

        if 'nombre' in datos_glamping:
            glamping.set_nombre(datos_glamping['nombre'])
        if 'capacidad' in datos_glamping:
            glamping.set_capacidad(int(datos_glamping['capacidad']))
        if 'precio_por_noche' in datos_glamping:
            glamping.set_precio_por_noche(int(datos_glamping['precio_por_noche']))
        if 'caracteristicas' in datos_glamping:
            glamping.set_caracteristicas(datos_glamping['caracteristicas'])
        if 'disponible' in datos_glamping:
            glamping.set_disponible(datos_glamping['disponible'])

        glamping.guardar()
        return glamping

    def actualizar_disponibilidad(self, id, disponible):
        """Actualiza la disponibilidad de un glamping.

        Args:
            id (int): ID del glamping.
            disponible (bool): Nueva disponibilidad.

        Returns:
            Glamping or None: Glamping actualizado o None.
        """
        glamping = self.buscar_por_id(id)
        if not glamping:
            return None

        glamping.set_disponible(disponible)
        glamping.guardar()
        return glamping

    def eliminar(self, id):
        """Elimina un glamping.

        Args:
            id (int): ID del glamping.

        Returns:
            bool: True si fue eliminado, False si no.
        """
        glamping = self.buscar_por_id(id)
        if not glamping:
            return False

        reservas = ReservaController().obtener_reservas_glamping(id)
        if reservas:
            raise ValueError(f"No se puede eliminar el glamping porque tiene {len(reservas)} reservas asociadas")

        glampings = self.obtener_todos()
        nuevos_glampings = [g for g in glampings if g.get_id() != id]
        guardar_glampings(nuevos_glampings)  # Función auxiliar asumida
        return True

    def validar(self, datos_glamping):
        """Valida los datos de un glamping.

        Args:
            datos_glamping (dict): Datos del glamping.

        Returns:
            dict: Errores encontrados.
        """
        errores = {}

        nombre = datos_glamping.get('nombre', '').strip()
        if not nombre:
            errores['nombre'] = 'El nombre es obligatorio'

        capacidad = datos_glamping.get('capacidad')
        try:
            capacidad = int(capacidad)
            if capacidad <= 0:
                errores['capacidad'] = 'La capacidad debe ser un número positivo'
        except (ValueError, TypeError):
            errores['capacidad'] = 'La capacidad debe ser un número válido'

        precio = datos_glamping.get('precio_por_noche')
        try:
            precio = int(precio)
            if precio <= 0:
                errores['precio_por_noche'] = 'El precio debe ser un número positivo'
        except (ValueError, TypeError):
            errores['precio_por_noche'] = 'El precio debe ser un número válido'

        caracteristicas = datos_glamping.get('caracteristicas')
        if caracteristicas is not None and not isinstance(caracteristicas, list):
            errores['caracteristicas'] = 'Las características deben ser una lista'

        return errores
