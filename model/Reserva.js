/**
 * Clase que representa una reserva de glamping
 */
class Reserva {
    /**
     * Constructor de la clase Reserva
     * @param {number} id - Identificador único de la reserva
     * @param {Cliente} cliente - Cliente que realiza la reserva
     * @param {Glamping} glamping - Glamping reservado
     * @param {string} fechaInicio - Fecha de inicio de la reserva (formato YYYY-MM-DD)
     * @param {string} fechaFin - Fecha de fin de la reserva (formato YYYY-MM-DD)
     * @param {number} totalPagado - Monto total pagado por la reserva
     * @param {string} estado - Estado de la reserva (confirmada, pendiente, cancelada)
     */
    constructor(id, cliente, glamping, fechaInicio, fechaFin, totalPagado, estado) {
        this.id = id;
        this.cliente = cliente;
        this.glamping = glamping;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.totalPagado = totalPagado;
        this.estado = estado;
    }

    /**
     * Obtiene el id de la reserva
     * @returns {number} El id de la reserva
     */
    getId() {
        return this.id;
    }

    /**
     * Establece el id de la reserva
     * @param {number} id - El nuevo id de la reserva
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Obtiene el cliente de la reserva
     * @returns {Cliente} El cliente de la reserva
     */
    getCliente() {
        return this.cliente;
    }

    /**
     * Establece el cliente de la reserva
     * @param {Cliente} cliente - El nuevo cliente de la reserva
     */
    setCliente(cliente) {
        this.cliente = cliente;
    }

    /**
     * Obtiene el glamping de la reserva
     * @returns {Glamping} El glamping de la reserva
     */
    getGlamping() {
        return this.glamping;
    }

    /**
     * Establece el glamping de la reserva
     * @param {Glamping} glamping - El nuevo glamping de la reserva
     */
    setGlamping(glamping) {
        this.glamping = glamping;
    }

    /**
     * Obtiene el ID del cliente (método de compatibilidad)
     * @returns {number} El ID del cliente
     */
    getClienteId() {
        return this.cliente.getId();
    }

    /**
     * Obtiene el ID del glamping (método de compatibilidad)
     * @returns {number} El ID del glamping
     */
    getGlampingId() {
        return this.glamping.getId();
    }

    /**
     * Obtiene la fecha de inicio de la reserva
     * @returns {string} La fecha de inicio de la reserva
     */
    getFechaInicio() {
        return this.fechaInicio;
    }

    /**
     * Establece la fecha de inicio de la reserva
     * @param {string} fechaInicio - La nueva fecha de inicio de la reserva
     */
    setFechaInicio(fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    /**
     * Obtiene la fecha de fin de la reserva
     * @returns {string} La fecha de fin de la reserva
     */
    getFechaFin() {
        return this.fechaFin;
    }

    /**
     * Establece la fecha de fin de la reserva
     * @param {string} fechaFin - La nueva fecha de fin de la reserva
     */
    setFechaFin(fechaFin) {
        this.fechaFin = fechaFin;
    }

    /**
     * Obtiene el total pagado por la reserva
     * @returns {number} El total pagado por la reserva
     */
    getTotalPagado() {
        return this.totalPagado;
    }

    /**
     * Establece el total pagado por la reserva
     * @param {number} totalPagado - El nuevo total pagado por la reserva
     */
    setTotalPagado(totalPagado) {
        this.totalPagado = totalPagado;
    }

    /**
     * Obtiene el estado de la reserva
     * @returns {string} El estado de la reserva
     */
    getEstado() {
        return this.estado;
    }

    /**
     * Establece el estado de la reserva
     * @param {string} estado - El nuevo estado de la reserva
     */
    setEstado(estado) {
        this.estado = estado;
    }

    /**
     * Calcula la duración de la reserva en días
     * @returns {number} La duración de la reserva en días
     */
    calcularDuracion() {
        const inicio = new Date(this.fechaInicio);
        const fin = new Date(this.fechaFin);
        const diferenciaTiempo = fin.getTime() - inicio.getTime();
        const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);
        return Math.ceil(diferenciaDias);
    }

    /**
     * Calcula el precio total de la reserva según la duración y el precio del glamping
     * @returns {number} El precio total de la reserva
     */
    calcularPrecioTotal() {
        const duracion = this.calcularDuracion();
        return duracion * this.glamping.getPrecioPorNoche();
    }

    /**
     * Convierte los datos de la reserva a formato JSON
     * @returns {Object} Objeto con los datos de la reserva
     */
    toJSON() {
        return {
            id: this.id,
            clienteId: this.cliente.getId(),
            glampingId: this.glamping.getId(),
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            totalPagado: this.totalPagado,
            estado: this.estado
        };
    }

    /**
     * Guarda la reserva actual en el almacenamiento local (localStorage)
     * @returns {boolean} true si la reserva se guardó correctamente, false en caso contrario
     */
    guardar() {
        try {
            // Leer reservas del localStorage
            let reservas = Reserva.obtenerReservas();
            
            // Obtener el ID más alto para asignar uno nuevo si es necesario
            const maxId = reservas.reduce((max, reserva) => 
                reserva.getId() > max ? reserva.getId() : max, 0);
            
            // Si la reserva no tiene ID, asignarle uno nuevo
            if (!this.id) {
                this.id = maxId + 1;
            }
            
            // Verificar si la reserva ya existe para actualizarla
            const index = reservas.findIndex(r => r.getId() === this.id);
            
            if (index !== -1) {
                // Actualizar reserva existente
                reservas[index] = this;
            } else {
                // Agregar nueva reserva
                reservas.push(this);
            }
            
            // Convertir las reservas a formato JSON
            const reservasJSON = reservas.map(reserva => reserva.toJSON());
            
            // Guardar en localStorage
            localStorage.setItem('reservas', JSON.stringify(reservasJSON));
            return true;
        } catch (error) {
            console.error('Error al guardar la reserva:', error);
            return false;
        }
    }

    /**
     * Obtiene todas las reservas del almacenamiento local (localStorage)
     * @returns {Array} Array de objetos Reserva
     */
    static obtenerReservas() {
        try {
            // Obtener datos del localStorage
            const reservasJSON = localStorage.getItem('reservas');
            
            if (!reservasJSON) {
                return [];
            }
            
            // Convertir datos JSON a objetos Reserva
            const reservasData = JSON.parse(reservasJSON);
            const reservas = [];
            
            // Cargar todos los clientes y glampings para hacer las relaciones
            const clientes = Cliente.obtenerClientes();
            const glampings = Glamping.obtenerGlampings();
            
            // Recorrer cada objeto JSON y convertirlo a un objeto Reserva
            for (let i = 0; i < reservasData.length; i++) {
                const reservaJSON = reservasData[i];
                
                // Buscar el cliente correspondiente
                const cliente = clientes.find(c => c.getId() === reservaJSON.clienteId);
                
                // Buscar el glamping correspondiente
                const glamping = glampings.find(g => g.getId() === reservaJSON.glampingId);
                
                // Si se encuentran tanto el cliente como el glamping, crear la reserva
                if (cliente && glamping) {
                    const reserva = new Reserva(
                        reservaJSON.id,
                        cliente,
                        glamping,
                        reservaJSON.fechaInicio,
                        reservaJSON.fechaFin,
                        reservaJSON.totalPagado,
                        reservaJSON.estado
                    );
                    reservas.push(reserva);
                }
            }
            
            return reservas;
        } catch (error) {
            console.error('Error al obtener las reservas:', error);
            return [];
        }
    }

    /**
     * Obtiene una reserva por su ID
     * @param {number} id - ID de la reserva a buscar
     * @returns {Reserva|null} La reserva encontrada o null si no existe
     */
    static obtenerReservaPorId(id) {
        const reservas = Reserva.obtenerReservas();
        
        // Recorrer el array de reservas para encontrar la que coincida con el ID
        for (let i = 0; i < reservas.length; i++) {
            if (reservas[i].getId() === id) {
                return reservas[i];
            }
        }
        
        // Si no se encuentra, retornar null
        return null;
    }

    /**
     * Obtiene las reservas de un cliente específico
     * @param {Cliente|number} cliente - Cliente o ID del cliente
     * @returns {Array} Array de objetos Reserva del cliente
     */
    static obtenerReservasPorCliente(cliente) {
        const reservas = Reserva.obtenerReservas();
        const reservasCliente = [];
        
        // Determinar el ID del cliente (puede recibir un objeto Cliente o un ID)
        const clienteId = typeof cliente === 'object' ? cliente.getId() : cliente;
        
        // Recorrer el array de reservas para encontrar las del cliente
        for (let i = 0; i < reservas.length; i++) {
            if (reservas[i].getClienteId() === clienteId) {
                reservasCliente.push(reservas[i]);
            }
        }
        
        return reservasCliente;
    }

    /**
     * Obtiene las reservas de un glamping específico
     * @param {Glamping|number} glamping - Glamping o ID del glamping
     * @returns {Array} Array de objetos Reserva del glamping
     */
    static obtenerReservasPorGlamping(glamping) {
        const reservas = Reserva.obtenerReservas();
        const reservasGlamping = [];
        
        // Determinar el ID del glamping (puede recibir un objeto Glamping o un ID)
        const glampingId = typeof glamping === 'object' ? glamping.getId() : glamping;
        
        // Recorrer el array de reservas para encontrar las del glamping
        for (let i = 0; i < reservas.length; i++) {
            if (reservas[i].getGlampingId() === glampingId) {
                reservasGlamping.push(reservas[i]);
            }
        }
        
        return reservasGlamping;
    }

    /**
     * Crea una instancia de Reserva a partir de un objeto JSON
     * @param {Object} json - Objeto con los datos de la reserva
     * @returns {Reserva} Una nueva instancia de Reserva
     */
    static fromJSON(json) {
        // Obtener el cliente
        const cliente = Cliente.obtenerClientes().find(c => c.getId() === json.clienteId);
        
        // Obtener el glamping
        const glamping = Glamping.obtenerGlampings().find(g => g.getId() === json.glampingId);
        
        // Verificar que se encontraron tanto el cliente como el glamping
        if (!cliente || !glamping) {
            throw new Error('No se pudo encontrar el cliente o el glamping');
        }
        
        return new Reserva(
            json.id,
            cliente,
            glamping,
            json.fechaInicio,
            json.fechaFin,
            json.totalPagado,
            json.estado
        );
    }
} 