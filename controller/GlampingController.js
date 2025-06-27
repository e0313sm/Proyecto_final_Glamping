/**
 * Controlador para la gestión de glampings
 */
class GlampingController {
    /**
     * Constructor del controlador de glampings
     */
    constructor() {
        // Inicialización si es necesaria
    }

    /**
     * Obtiene todos los glampings
     * @returns {Array} Lista de todos los glampings
     */
    obtenerTodos() {
        return Glamping.obtenerGlampings();
    }

    /**
     * Obtiene los glampings disponibles
     * @returns {Array} Lista de glampings disponibles
     */
    obtenerDisponibles() {
        return Glamping.obtenerGlampingsDisponibles();
    }

    /**
     * Busca un glamping por su ID
     * @param {number} id - ID del glamping a buscar
     * @returns {Glamping|null} El glamping encontrado o null si no existe
     */
    buscarPorId(id) {
        return Glamping.obtenerGlampingPorId(id);
    }

    /**
     * Busca glampings por nombre (búsqueda parcial)
     * @param {string} nombre - Nombre o parte del nombre a buscar
     * @returns {Array} Lista de glampings que coinciden con la búsqueda
     */
    buscarPorNombre(nombre) {
        const glampings = this.obtenerTodos();
        const nombreBusqueda = nombre.toLowerCase();
        return glampings.filter(glamping => 
            glamping.getNombre().toLowerCase().includes(nombreBusqueda)
        );
    }

    /**
     * Busca glampings por capacidad
     * @param {number} capacidad - Capacidad mínima requerida
     * @returns {Array} Lista de glampings con capacidad igual o mayor a la solicitada
     */
    buscarPorCapacidad(capacidad) {
        const glampings = Glamping.obtenerGlampings();
        return glampings.filter(glamping => 
            glamping.getCapacidad() >= parseInt(capacidad)
        );
    }

    /**
     * Busca glampings por rango de precio
     * @param {number} precioMin - Precio mínimo por noche
     * @param {number} precioMax - Precio máximo por noche
     * @returns {Array} Lista de glampings dentro del rango de precios
     */
    buscarPorRangoPrecio(precioMin, precioMax) {
        const glampings = Glamping.obtenerGlampings();
        return glampings.filter(glamping => {
            const precio = glamping.getPrecioPorNoche();
            return precio >= parseInt(precioMin) && precio <= parseInt(precioMax);
        });
    }

    /**
     * Busca glampings por característica
     * @param {string} caracteristica - Característica a buscar
     * @returns {Array} Lista de glampings que tienen la característica
     */
    buscarPorCaracteristica(caracteristica) {
        const glampings = Glamping.obtenerGlampings();
        const caracteristicaBusqueda = caracteristica.toLowerCase();
        return glampings.filter(glamping => 
            glamping.getCaracteristicas().some(c => 
                c.toLowerCase().includes(caracteristicaBusqueda)
            )
        );
    }

    /**
     * Crea un nuevo glamping
     * @param {Object} datosGlamping - Datos del nuevo glamping
     * @returns {Glamping} El glamping creado
     */
    crear(datosGlamping) {
        // Validar los datos antes de crear el glamping
        const errores = this.validar(datosGlamping);
        if (Object.keys(errores).length > 0) {
            throw new Error(JSON.stringify(errores));
        }

        const glamping = new Glamping(
            null, // El ID se asignará automáticamente en el método guardar
            datosGlamping.nombre,
            parseInt(datosGlamping.capacidad),
            parseInt(datosGlamping.precioPorNoche),
            datosGlamping.caracteristicas || [],
            datosGlamping.disponible !== undefined ? datosGlamping.disponible : true
        );
        
        glamping.guardar();
        return glamping;
    }

    /**
     * Actualiza los datos de un glamping existente
     * @param {number} id - ID del glamping a actualizar
     * @param {Object} datosGlamping - Nuevos datos del glamping
     * @returns {Glamping|null} El glamping actualizado o null si no existe
     */
    actualizar(id, datosGlamping) {
        const glamping = this.buscarPorId(id);
        
        if (!glamping) {
            return null;
        }
        
        // Validar los datos antes de actualizar el glamping
        const errores = this.validar(datosGlamping);
        if (Object.keys(errores).length > 0) {
            throw new Error(JSON.stringify(errores));
        }
        
        // Actualizar sólo los campos que vienen en los datos
        if (datosGlamping.nombre) glamping.setNombre(datosGlamping.nombre);
        if (datosGlamping.capacidad) glamping.setCapacidad(parseInt(datosGlamping.capacidad));
        if (datosGlamping.precioPorNoche) glamping.setPrecioPorNoche(parseInt(datosGlamping.precioPorNoche));
        if (datosGlamping.caracteristicas) glamping.setCaracteristicas(datosGlamping.caracteristicas);
        if (datosGlamping.disponible !== undefined) glamping.setDisponible(datosGlamping.disponible);
        
        glamping.guardar();
        return glamping;
    }

    /**
     * Actualiza la disponibilidad de un glamping
     * @param {number} id - ID del glamping a actualizar
     * @param {boolean} disponible - Nueva disponibilidad del glamping
     * @returns {Glamping|null} El glamping actualizado o null si no existe
     */
    actualizarDisponibilidad(id, disponible) {
        const glamping = this.buscarPorId(id);
        
        if (!glamping) {
            return null;
        }
        
        glamping.setDisponible(disponible);
        glamping.guardar();
        return glamping;
    }

    /**
     * Elimina un glamping
     * @param {number} id - ID del glamping a eliminar
     * @returns {boolean} true si se eliminó correctamente, false en caso contrario
     */
    eliminar(id) {
        // Verificar si el glamping existe
        const glamping = this.buscarPorId(id);
        if (!glamping) {
            return false;
        }
        
        // Verificar si hay reservas con este glamping
        const reservaController = new ReservaController();
        const reservasGlamping = reservaController.obtenerReservasGlamping(id);
        
        if (reservasGlamping.length > 0) {
            throw new Error(`No se puede eliminar el glamping porque tiene ${reservasGlamping.length} reservas asociadas`);
        }
        
        // Eliminar el glamping del almacenamiento
        const glampings = this.obtenerTodos();
        const glampingsFiltrados = glampings.filter(g => g.getId() !== id);
        
        // Guardar la lista actualizada de glampings
        localStorage.setItem('glampings', JSON.stringify(glampingsFiltrados.map(g => g.toJSON())));
        
        return true;
    }

    /**
     * Valida los datos de un glamping
     * @param {Object} datosGlamping - Datos del glamping a validar
     * @returns {Object} Objeto con los errores encontrados, vacío si no hay errores
     */
    validar(datosGlamping) {
        const errores = {};
        
        // Validar nombre
        if (!datosGlamping.nombre || datosGlamping.nombre.trim() === '') {
            errores.nombre = 'El nombre es obligatorio';
        }
        
        // Validar capacidad
        if (datosGlamping.capacidad === undefined) {
            errores.capacidad = 'La capacidad es obligatoria';
        } else {
            const capacidad = parseInt(datosGlamping.capacidad);
            if (isNaN(capacidad) || capacidad <= 0) {
                errores.capacidad = 'La capacidad debe ser un número positivo';
            }
        }
        
        // Validar precio por noche
        if (datosGlamping.precioPorNoche === undefined) {
            errores.precioPorNoche = 'El precio por noche es obligatorio';
        } else {
            const precio = parseInt(datosGlamping.precioPorNoche);
            if (isNaN(precio) || precio <= 0) {
                errores.precioPorNoche = 'El precio por noche debe ser un número positivo';
            }
        }
        
        // Validar características
        if (datosGlamping.caracteristicas !== undefined && !Array.isArray(datosGlamping.caracteristicas)) {
            errores.caracteristicas = 'Las características deben ser una lista';
        }
        
        return errores;
    }
} 