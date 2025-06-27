/**
 * Controlador para la gestión de reservas
 */
class ReservaController {
    /**
     * Constructor del controlador de reservas
     */
    constructor() {
        // Inicialización si es necesaria
    }

    /**
     * Obtiene todas las reservas
     * @returns {Array} Lista de todas las reservas
     */
    obtenerTodas() {
        return Reserva.obtenerReservas();
    }

    /**
     * Busca una reserva por su ID
     * @param {number} id - ID de la reserva a buscar
     * @returns {Reserva|null} La reserva encontrada o null si no existe
     */
    buscarPorId(id) {
        return Reserva.obtenerReservaPorId(id);
    }

    /**
     * Obtiene las reservas de un cliente específico
     * @param {number} clienteId - ID del cliente
     * @returns {Array} Lista de reservas del cliente
     */
    obtenerReservasCliente(clienteId) {
        return Reserva.obtenerReservasPorCliente(clienteId);
    }

    /**
     * Obtiene las reservas de un glamping específico
     * @param {number} glampingId - ID del glamping
     * @returns {Array} Lista de reservas del glamping
     */
    obtenerReservasGlamping(glampingId) {
        return Reserva.obtenerReservasPorGlamping(glampingId);
    }

    /**
     * Obtiene las reservas por estado
     * @param {string} estado - Estado de las reservas a buscar
     * @returns {Array} Lista de reservas con el estado especificado
     */
    obtenerReservasPorEstado(estado) {
        const reservas = this.obtenerTodas();
        return reservas.filter(reserva => reserva.getEstado() === estado);
    }

    /**
     * Crea una nueva reserva
     * @param {Object} datosReserva - Datos de la nueva reserva
     * @returns {Reserva} La reserva creada
     */
    crear(datosReserva) {
        // Validar los datos de la reserva
        const errores = this.validar(datosReserva);
        if (Object.keys(errores).length > 0) {
            throw new Error(JSON.stringify(errores));
        }
        
        // Verificar disponibilidad
        if (!this.verificarDisponibilidad(datosReserva.glampingId, datosReserva.fechaInicio, datosReserva.fechaFin)) {
            throw new Error('El glamping no está disponible para las fechas seleccionadas');
        }
        
        // Buscar el cliente
        const clienteController = new ClienteController();
        const cliente = clienteController.buscarPorId(parseInt(datosReserva.clienteId));
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        
        // Buscar el glamping
        const glampingController = new GlampingController();
        const glamping = glampingController.buscarPorId(parseInt(datosReserva.glampingId));
        if (!glamping) {
            throw new Error('Glamping no encontrado');
        }
        
        // Asignar el estado si no se proporcionó
        const estado = datosReserva.estado || 'pendiente';
        
        // Crear la nueva reserva
        const reserva = new Reserva(
            null, // El ID se asignará automáticamente
            cliente,
            glamping,
            datosReserva.fechaInicio,
            datosReserva.fechaFin,
            parseFloat(datosReserva.totalPagado) || 0,
            estado
        );
        
        // Guardar la reserva
        reserva.guardar();
        
        return reserva;
    }

    /**
     * Actualiza los datos de una reserva existente
     * @param {number} id - ID de la reserva a actualizar
     * @param {Object} datosReserva - Nuevos datos de la reserva
     * @returns {Reserva|null} La reserva actualizada o null si no existe
     */
    actualizar(id, datosReserva) {
        // Buscar la reserva por ID
        const reserva = this.buscarPorId(id);
        if (!reserva) {
            return null;
        }
        
        // Validar los datos de la reserva
        const errores = this.validar(datosReserva);
        if (Object.keys(errores).length > 0) {
            throw new Error(JSON.stringify(errores));
        }
        
        // Si se cambia el glamping o las fechas, verificar disponibilidad
        if ((datosReserva.glampingId && parseInt(datosReserva.glampingId) !== reserva.getGlampingId()) ||
            (datosReserva.fechaInicio && datosReserva.fechaInicio !== reserva.getFechaInicio()) ||
            (datosReserva.fechaFin && datosReserva.fechaFin !== reserva.getFechaFin())) {
            
            const glampingId = datosReserva.glampingId ? parseInt(datosReserva.glampingId) : reserva.getGlampingId();
            const fechaInicio = datosReserva.fechaInicio || reserva.getFechaInicio();
            const fechaFin = datosReserva.fechaFin || reserva.getFechaFin();
            
            // Verificar disponibilidad excluyendo la reserva actual
            if (!this.verificarDisponibilidad(glampingId, fechaInicio, fechaFin, id)) {
                throw new Error('El glamping no está disponible para las fechas seleccionadas');
            }
        }
        
        // Actualizar los datos del cliente si se cambió
        if (datosReserva.clienteId && parseInt(datosReserva.clienteId) !== reserva.getClienteId()) {
            const clienteController = new ClienteController();
            const cliente = clienteController.buscarPorId(parseInt(datosReserva.clienteId));
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }
            reserva.setCliente(cliente);
        }
        
        // Actualizar los datos del glamping si se cambió
        if (datosReserva.glampingId && parseInt(datosReserva.glampingId) !== reserva.getGlampingId()) {
            const glampingController = new GlampingController();
            const glamping = glampingController.buscarPorId(parseInt(datosReserva.glampingId));
            if (!glamping) {
                throw new Error('Glamping no encontrado');
            }
            reserva.setGlamping(glamping);
        }
        
        // Actualizar los demás campos si se proporcionaron
        if (datosReserva.fechaInicio) reserva.setFechaInicio(datosReserva.fechaInicio);
        if (datosReserva.fechaFin) reserva.setFechaFin(datosReserva.fechaFin);
        if (datosReserva.totalPagado !== undefined) reserva.setTotalPagado(parseFloat(datosReserva.totalPagado) || 0);
        if (datosReserva.estado) reserva.setEstado(datosReserva.estado);
        
        // Guardar los cambios
        reserva.guardar();
        
        return reserva;
    }

    /**
     * Actualiza el estado de una reserva
     * @param {number} id - ID de la reserva a actualizar
     * @param {string} estado - Nuevo estado de la reserva
     * @returns {Reserva|null} La reserva actualizada o null si no existe
     */
    actualizarEstado(id, estado) {
        const reserva = this.buscarPorId(id);
        
        if (!reserva) {
            return null;
        }
        
        // Validar el estado
        if (!['confirmada', 'pendiente', 'cancelada'].includes(estado)) {
            throw new Error('Estado de reserva no válido');
        }
        
        reserva.setEstado(estado);
        reserva.guardar();
        return reserva;
    }

    /**
     * Elimina una reserva
     * @param {number} id - ID de la reserva a eliminar
     * @returns {boolean} true si se eliminó correctamente, false en caso contrario
     */
    eliminar(id) {
        // Verificar si la reserva existe
        const reserva = this.buscarPorId(id);
        if (!reserva) {
            return false;
        }
        
        // Eliminar la reserva del almacenamiento
        const reservas = this.obtenerTodas();
        const reservasFiltradas = reservas.filter(r => r.getId() !== id);
        
        // Guardar la lista actualizada de reservas
        localStorage.setItem('reservas', JSON.stringify(reservasFiltradas.map(r => r.toJSON())));
        
        return true;
    }

    /**
     * Verifica si un glamping está disponible para un rango de fechas
     * @param {number} glampingId - ID del glamping
     * @param {string} fechaInicio - Fecha de inicio (formato YYYY-MM-DD)
     * @param {string} fechaFin - Fecha de fin (formato YYYY-MM-DD)
     * @param {number} reservaIdExcluir - ID de reserva a excluir de la verificación (para ediciones)
     * @returns {boolean} true si el glamping está disponible, false en caso contrario
     */
    verificarDisponibilidad(glampingId, fechaInicio, fechaFin, reservaIdExcluir = null) {
        // Convertir parámetros
        glampingId = parseInt(glampingId);
        
        // Verificar que el glamping exista y esté disponible
        const glampingController = new GlampingController();
        const glamping = glampingController.buscarPorId(glampingId);
        
        if (!glamping || !glamping.isDisponible()) {
            return false;
        }
        
        // Convertir fechas a objetos Date
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        // Verificar que las fechas sean válidas
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return false;
        }
        
        // Verificar que la fecha de fin sea posterior a la de inicio
        if (fin <= inicio) {
            return false;
        }
        
        // Obtener todas las reservas del glamping
        const reservasGlamping = this.obtenerReservasGlamping(glampingId);
        
        // Verificar si hay solapamiento con alguna reserva existente
        for (let i = 0; i < reservasGlamping.length; i++) {
            const reserva = reservasGlamping[i];
            
            // Excluir la reserva que se está editando
            if (reservaIdExcluir && reserva.getId() === reservaIdExcluir) {
                continue;
            }
            
            // Solo verificar reservas confirmadas o pendientes (no canceladas)
            if (reserva.getEstado() === 'cancelada') {
                continue;
            }
            
            const reservaInicio = new Date(reserva.getFechaInicio());
            const reservaFin = new Date(reserva.getFechaFin());
            
            // Verificar solapamiento de fechas
            // Si la fecha de inicio de la nueva reserva está dentro de una reserva existente
            // o si la fecha de fin de la nueva reserva está dentro de una reserva existente
            // o si la nueva reserva engloba completamente una reserva existente
            if ((inicio >= reservaInicio && inicio < reservaFin) ||
                (fin > reservaInicio && fin <= reservaFin) ||
                (inicio <= reservaInicio && fin >= reservaFin)) {
                return false;
            }
        }
        
        // Si no hay solapamiento, el glamping está disponible
        return true;
    }

    /**
     * Valida los datos de una reserva
     * @param {Object} datosReserva - Datos de la reserva a validar
     * @returns {Object} Objeto con los errores encontrados, vacío si no hay errores
     */
    validar(datosReserva) {
        const errores = {};
        
        // Validar cliente
        if (!datosReserva.clienteId) {
            errores.clienteId = 'El cliente es obligatorio';
        }
        
        // Validar glamping
        if (!datosReserva.glampingId) {
            errores.glampingId = 'El glamping es obligatorio';
        }
        
        // Validar fecha de inicio
        if (!datosReserva.fechaInicio) {
            errores.fechaInicio = 'La fecha de inicio es obligatoria';
        } else if (!this.validarFormatoFecha(datosReserva.fechaInicio)) {
            errores.fechaInicio = 'El formato de la fecha de inicio no es válido (YYYY-MM-DD)';
        }
        
        // Validar fecha de fin
        if (!datosReserva.fechaFin) {
            errores.fechaFin = 'La fecha de fin es obligatoria';
        } else if (!this.validarFormatoFecha(datosReserva.fechaFin)) {
            errores.fechaFin = 'El formato de la fecha de fin no es válido (YYYY-MM-DD)';
        }
        
        // Validar que la fecha de fin sea posterior a la de inicio
        if (datosReserva.fechaInicio && datosReserva.fechaFin && 
            this.validarFormatoFecha(datosReserva.fechaInicio) && 
            this.validarFormatoFecha(datosReserva.fechaFin)) {
            
            const inicio = new Date(datosReserva.fechaInicio);
            const fin = new Date(datosReserva.fechaFin);
            
            if (fin <= inicio) {
                errores.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
            }
        }
        
        // Validar estado si se proporciona
        if (datosReserva.estado && !['confirmada', 'pendiente', 'cancelada'].includes(datosReserva.estado)) {
            errores.estado = 'Estado no válido, debe ser: confirmada, pendiente o cancelada';
        }
        
        // Validar totalPagado si se proporciona
        if (datosReserva.totalPagado !== undefined) {
            const total = parseFloat(datosReserva.totalPagado);
            if (isNaN(total) || total < 0) {
                errores.totalPagado = 'El total pagado debe ser un número positivo';
            }
        }
        
        return errores;
    }
    
    /**
     * Valida el formato de una fecha (YYYY-MM-DD)
     * @param {string} fecha - Fecha a validar
     * @returns {boolean} true si el formato es válido, false en caso contrario
     */
    validarFormatoFecha(fecha) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(fecha)) {
            return false;
        }
        
        const date = new Date(fecha);
        return date instanceof Date && !isNaN(date);
    }
} 