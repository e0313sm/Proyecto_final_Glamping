/**
 * Clase que representa un cliente
 */
class Cliente {
    /**
     * Constructor de la clase Cliente
     * @param {number} id - Identificador único del cliente
     * @param {string} nombre - Nombre completo del cliente
     * @param {string} email - Correo electrónico del cliente
     * @param {string} telefono - Número de teléfono del cliente
     * @param {string} documento - Número de documento de identidad del cliente
     */
    constructor(id, nombre, email, telefono, documento) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.documento = documento;
    }

    /**
     * Obtiene el id del cliente
     * @returns {number} El id del cliente
     */
    getId() {
        return this.id;
    }

    /**
     * Establece el id del cliente
     * @param {number} id - El nuevo id del cliente
     */
    setId(id) {
        this.id = id;
    }

    /**
     * Obtiene el nombre del cliente
     * @returns {string} El nombre del cliente
     */
    getNombre() {
        return this.nombre;
    }

    /**
     * Establece el nombre del cliente
     * @param {string} nombre - El nuevo nombre del cliente
     */
    setNombre(nombre) {
        this.nombre = nombre;
    }

    /**
     * Obtiene el email del cliente
     * @returns {string} El email del cliente
     */
    getEmail() {
        return this.email;
    }

    /**
     * Establece el email del cliente
     * @param {string} email - El nuevo email del cliente
     */
    setEmail(email) {
        this.email = email;
    }

    /**
     * Obtiene el teléfono del cliente
     * @returns {string} El teléfono del cliente
     */
    getTelefono() {
        return this.telefono;
    }

    /**
     * Establece el teléfono del cliente
     * @param {string} telefono - El nuevo teléfono del cliente
     */
    setTelefono(telefono) {
        this.telefono = telefono;
    }

    /**
     * Obtiene el documento del cliente
     * @returns {string} El documento del cliente
     */
    getDocumento() {
        return this.documento;
    }

    /**
     * Establece el documento del cliente
     * @param {string} documento - El nuevo documento del cliente
     */
    setDocumento(documento) {
        this.documento = documento;
    }

    /**
     * Convierte los datos del cliente a formato JSON
     * @returns {Object} Objeto con los datos del cliente
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email,
            telefono: this.telefono,
            documento: this.documento
        };
    }

    /**
     * Guarda el cliente actual en el almacenamiento local (localStorage)
     * @returns {boolean} true si el cliente se guardó correctamente, false en caso contrario
     */
    guardar() {
        try {
            // Leer clientes del localStorage
            let clientes = Cliente.obtenerClientes();
            
            // Obtener el ID más alto para asignar uno nuevo si es necesario
            const maxId = clientes.reduce((max, cliente) => 
                cliente.getId() > max ? cliente.getId() : max, 0);
            
            // Si el cliente no tiene ID, asignarle uno nuevo
            if (!this.id) {
                this.id = maxId + 1;
            }
            
            // Verificar si el cliente ya existe para actualizarlo
            const index = clientes.findIndex(c => c.getId() === this.id);
            
            if (index !== -1) {
                // Actualizar cliente existente
                clientes[index] = this;
            } else {
                // Agregar nuevo cliente
                clientes.push(this);
            }
            
            // Convertir los clientes a formato JSON
            const clientesJSON = clientes.map(cliente => cliente.toJSON());
            
            // Guardar en localStorage
            localStorage.setItem('clientes', JSON.stringify(clientesJSON));
            return true;
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
            return false;
        }
    }

    /**
     * Obtiene todos los clientes del almacenamiento local (localStorage)
     * @returns {Array} Array de objetos Cliente
     */
    static obtenerClientes() {
        try {
            // Obtener datos del localStorage
            const clientesJSON = localStorage.getItem('clientes');
            
            if (!clientesJSON) {
                return [];
            }
            
            // Convertir datos JSON a objetos Cliente
            const clientes = JSON.parse(clientesJSON).map(clienteJSON => 
                new Cliente(
                    clienteJSON.id,
                    clienteJSON.nombre,
                    clienteJSON.email,
                    clienteJSON.telefono,
                    clienteJSON.documento
                )
            );
            
            return clientes;
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
            return [];
        }
    }

    /**
     * Obtiene un cliente por su ID
     * @param {number} id - ID del cliente a buscar
     * @returns {Cliente|null} El cliente encontrado o null si no existe
     */
    static obtenerClientePorId(id) {
        const clientes = Cliente.obtenerClientes();
        
        // Recorrer el array de clientes para encontrar el que coincida con el ID
        for (let i = 0; i < clientes.length; i++) {
            if (clientes[i].getId() === id) {
                return clientes[i];
            }
        }
        
        // Si no se encuentra, retornar null
        return null;
    }

    /**
     * Crea una instancia de Cliente a partir de un objeto JSON
     * @param {Object} json - Objeto con los datos del cliente
     * @returns {Cliente} Una nueva instancia de Cliente
     */
    static fromJSON(json) {
        return new Cliente(
            json.id,
            json.nombre,
            json.email,
            json.telefono,
            json.documento
        );
    }
} 