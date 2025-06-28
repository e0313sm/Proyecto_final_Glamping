class ReservaController:
    """
    Controlador para la gestión de reservas.
    """

    def __init__(self):
        """Constructor del controlador de reservas."""
        pass

    def obtener_todas(self):
        """Obtiene todas las reservas.

        Returns:
            list: Lista de todas las reservas.
        """
        return Reserva.obtener_reservas()

    def buscar_por_id(self, id):
        """Busca una reserva por su ID.

        Args:
            id (int): ID de la reserva a buscar.

        Returns:
            Reserva or None: La reserva encontrada o None si no existe.
        """
        return Reserva.obtener_reserva_por_id(id)

    def obtener_reservas_cliente(self, cliente_id):
        """Obtiene las reservas de un cliente específico.

        Args:
            cliente_id (int): ID del cliente.

        Returns:
            list: Lista de reservas del cliente.
        """
        return Reserva.obtener_reservas_por_cliente(cliente_id)

    def obtener_reservas_glamping(self, glamping_id):
        """Obtiene las reservas de un glamping específico.

        Args:
            glamping_id (int): ID del glamping.

        Returns:
            list: Lista de reservas del glamping.
        """
        return Reserva.obtener_reservas_por_glamping(glamping_id)

    def obtener_reservas_por_estado(self, estado):
        """Obtiene las reservas por estado.

        Args:
            estado (str): Estado de las reservas a buscar.

        Returns:
            list: Lista de reservas con el estado especificado.
        """
        return [r for r in self.obtener_todas() if r.get_estado() == estado]

    def crear(self, datos_reserva):
        """Crea una nueva reserva.

        Args:
            datos_reserva (dict): Datos de la nueva reserva.

        Returns:
            Reserva: La reserva creada.
        """
        errores = self.validar(datos_reserva)
        if errores:
            raise ValueError(errores)

        if not self.verificar_disponibilidad(
            datos_reserva['glamping_id'],
            datos_reserva['fecha_inicio'],
            datos_reserva['fecha_fin']):
            raise ValueError('El glamping no está disponible para las fechas seleccionadas')

        cliente = ClienteController().buscar_por_id(int(datos_reserva['cliente_id']))
        if not cliente:
            raise ValueError('Cliente no encontrado')

        glamping = GlampingController().buscar_por_id(int(datos_reserva['glamping_id']))
        if not glamping:
            raise ValueError('Glamping no encontrado')

        estado = datos_reserva.get('estado', 'pendiente')

        reserva = Reserva(
            id=None,
            cliente=cliente,
            glamping=glamping,
            fecha_inicio=datos_reserva['fecha_inicio'],
            fecha_fin=datos_reserva['fecha_fin'],
            total_pagado=float(datos_reserva.get('total_pagado', 0)),
            estado=estado
        )
        reserva.guardar()
        return reserva

    def actualizar(self, id, datos_reserva):
        """Actualiza los datos de una reserva existente.

        Args:
            id (int): ID de la reserva.
            datos_reserva (dict): Nuevos datos.

        Returns:
            Reserva or None: Reserva actualizada o None.
        """
        reserva = self.buscar_por_id(id)
        if not reserva:
            return None

        errores = self.validar(datos_reserva)
        if errores:
            raise ValueError(errores)

        cambios = (
            datos_reserva.get('glamping_id') and int(datos_reserva['glamping_id']) != reserva.get_glamping_id() or
            datos_reserva.get('fecha_inicio') != reserva.get_fecha_inicio() or
            datos_reserva.get('fecha_fin') != reserva.get_fecha_fin()
        )

        if cambios:
            disponible = self.verificar_disponibilidad(
                int(datos_reserva.get('glamping_id', reserva.get_glamping_id())),
                datos_reserva.get('fecha_inicio', reserva.get_fecha_inicio()),
                datos_reserva.get('fecha_fin', reserva.get_fecha_fin()),
                id
            )
            if not disponible:
                raise ValueError('El glamping no está disponible para las fechas seleccionadas')

        if 'cliente_id' in datos_reserva and int(datos_reserva['cliente_id']) != reserva.get_cliente_id():
            cliente = ClienteController().buscar_por_id(int(datos_reserva['cliente_id']))
            if not cliente:
                raise ValueError('Cliente no encontrado')
            reserva.set_cliente(cliente)

        if 'glamping_id' in datos_reserva and int(datos_reserva['glamping_id']) != reserva.get_glamping_id():
            glamping = GlampingController().buscar_por_id(int(datos_reserva['glamping_id']))
            if not glamping:
                raise ValueError('Glamping no encontrado')
            reserva.set_glamping(glamping)

        if 'fecha_inicio' in datos_reserva:
            reserva.set_fecha_inicio(datos_reserva['fecha_inicio'])
        if 'fecha_fin' in datos_reserva:
            reserva.set_fecha_fin(datos_reserva['fecha_fin'])
        if 'total_pagado' in datos_reserva:
            reserva.set_total_pagado(float(datos_reserva['total_pagado'] or 0))
        if 'estado' in datos_reserva:
            reserva.set_estado(datos_reserva['estado'])

        reserva.guardar()
        return reserva

    def actualizar_estado(self, id, estado):
        """Actualiza el estado de una reserva.

        Args:
            id (int): ID de la reserva.
            estado (str): Nuevo estado.

        Returns:
            Reserva or None: Reserva actualizada o None.
        """
        reserva = self.buscar_por_id(id)
        if not reserva:
            return None

        if estado not in ['confirmada', 'pendiente', 'cancelada']:
            raise ValueError('Estado de reserva no válido')

        reserva.set_estado(estado)
        reserva.guardar()
        return reserva

    def eliminar(self, id):
        """Elimina una reserva.

        Args:
            id (int): ID de la reserva.

        Returns:
            bool: True si fue eliminada, False si no existe.
        """
        reserva = self.buscar_por_id(id)
        if not reserva:
            return False

        reservas = self.obtener_todas()
        nuevas_reservas = [r for r in reservas if r.get_id() != id]
        guardar_reservas(nuevas_reservas)  # Suponiendo función que guarda en almacenamiento
        return True

    def verificar_disponibilidad(self, glamping_id, fecha_inicio, fecha_fin, reserva_id_excluir=None):
        """Verifica si un glamping está disponible para un rango de fechas.

        Args:
            glamping_id (int)
            fecha_inicio (str)
            fecha_fin (str)
            reserva_id_excluir (int or None)

        Returns:
            bool: True si está disponible, False en caso contrario.
        """
        glamping = GlampingController().buscar_por_id(glamping_id)
        if not glamping or not glamping.is_disponible():
            return False

        try:
            inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return False

        if fin <= inicio:
            return False

        reservas = self.obtener_reservas_glamping(glamping_id)
        for r in reservas:
            if reserva_id_excluir and r.get_id() == reserva_id_excluir:
                continue
            if r.get_estado() == 'cancelada':
                continue
            r_inicio = datetime.strptime(r.get_fecha_inicio(), '%Y-%m-%d')
            r_fin = datetime.strptime(r.get_fecha_fin(), '%Y-%m-%d')

            if (inicio >= r_inicio and inicio < r_fin) or \
               (fin > r_inicio and fin <= r_fin) or \
               (inicio <= r_inicio and fin >= r_fin):
                return False

        return True

    def validar(self, datos_reserva):
        """Valida los datos de una reserva.

        Args:
            datos_reserva (dict)

        Returns:
            dict: Errores encontrados.
        """
        errores = {}

        if not datos_reserva.get('cliente_id'):
            errores['cliente_id'] = 'El cliente es obligatorio'
        if not datos_reserva.get('glamping_id'):
            errores['glamping_id'] = 'El glamping es obligatorio'

        fecha_inicio = datos_reserva.get('fecha_inicio')
        fecha_fin = datos_reserva.get('fecha_fin')

        if not fecha_inicio:
            errores['fecha_inicio'] = 'La fecha de inicio es obligatoria'
        elif not self.validar_formato_fecha(fecha_inicio):
            errores['fecha_inicio'] = 'Formato inválido (YYYY-MM-DD)'

        if not fecha_fin:
            errores['fecha_fin'] = 'La fecha de fin es obligatoria'
        elif not self.validar_formato_fecha(fecha_fin):
            errores['fecha_fin'] = 'Formato inválido (YYYY-MM-DD)'

        if fecha_inicio and fecha_fin and self.validar_formato_fecha(fecha_inicio) and self.validar_formato_fecha(fecha_fin):
            ini = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
            if fin <= ini:
                errores['fecha_fin'] = 'La fecha de fin debe ser posterior a la de inicio'

        estado = datos_reserva.get('estado')
        if estado and estado not in ['confirmada', 'pendiente', 'cancelada']:
            errores['estado'] = 'Estado no válido'

        if 'total_pagado' in datos_reserva:
            try:
                total = float(datos_reserva['total_pagado'])
                if total < 0:
                    errores['total_pagado'] = 'El total pagado debe ser un número positivo'
            except ValueError:
                errores['total_pagado'] = 'El total pagado debe ser un número'

        return errores

    def validar_formato_fecha(self, fecha):
        """Valida el formato de una fecha (YYYY-MM-DD).

        Args:
            fecha (str): Fecha a validar.

        Returns:
            bool: True si el formato es válido, False en caso contrario.
        """
        try:
            datetime.strptime(fecha, '%Y-%m-%d')
            return True
        except ValueError:
            return False
