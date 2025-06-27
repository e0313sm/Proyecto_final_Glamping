/**
 * Script para la gestión de clientes integrado con el controlador
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const formCliente = document.getElementById('form-cliente');
    const clienteId = document.getElementById('cliente-id');
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const documentoInput = document.getElementById('documento');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaClientes = document.getElementById('tabla-clientes').querySelector('tbody');
    const modal = document.getElementById('modal-confirmar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    const alertsContainer = document.getElementById('alerts-container');
    
    let clienteIdEliminar = null;
    
    // Instanciar el controlador de clientes
    const clienteController = new ClienteController();

    // Cargar clientes al iniciar
    cargarClientes();

    // Evento para guardar o actualizar cliente
    formCliente.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const datosCliente = {
            nombre: nombreInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            documento: documentoInput.value
        };
        
        try {
            // Validar datos
            const errores = clienteController.validar(datosCliente);
            if (Object.keys(errores).length > 0) {
                mostrarErrores(errores);
                return;
            }
            
            if (clienteId.value) {
                // Actualizar cliente existente
                const clienteActualizado = clienteController.actualizar(parseInt(clienteId.value), datosCliente);
                if (clienteActualizado) {
                    mostrarAlerta('Cliente actualizado con éxito', 'success');
                    resetearFormulario();
                    cargarClientes();
                } else {
                    mostrarAlerta('No se encontró el cliente a actualizar', 'danger');
                }
            } else {
                // Crear nuevo cliente
                clienteController.crear(datosCliente);
                mostrarAlerta('Cliente creado con éxito', 'success');
                resetearFormulario();
                cargarClientes();
            }
        } catch (error) {
            mostrarAlerta('Error: ' + error.message, 'danger');
        }
    });

    // Evento para cancelar edición
    btnCancelar.addEventListener('click', resetearFormulario);

    // Cerrar modal cuando se hace clic en el botón de cerrar o fuera del modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    // Confirmar eliminación
    btnConfirmarEliminar.addEventListener('click', function() {
        if (clienteIdEliminar) {
            eliminarCliente(clienteIdEliminar);
            modal.style.display = 'none';
            clienteIdEliminar = null;
        }
    });

    /**
     * Carga la lista de clientes desde el controlador
     */
    function cargarClientes() {
        const clientes = clienteController.obtenerTodos();
        renderizarClientes(clientes);
    }

    /**
     * Renderiza la lista de clientes en la tabla
     * @param {Array} clientes - Lista de clientes a mostrar
     */
    function renderizarClientes(clientes) {
        tablaClientes.innerHTML = '';
        
        clientes.forEach(cliente => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${cliente.getId()}</td>
                <td>${cliente.getNombre()}</td>
                <td>${cliente.getEmail()}</td>
                <td>${cliente.getTelefono()}</td>
                <td>${cliente.getDocumento()}</td>
                <td class="action-buttons">
                    <button class="btn-editar" data-id="${cliente.getId()}">Editar</button>
                    <button class="btn-eliminar danger" data-id="${cliente.getId()}">Eliminar</button>
                </td>
            `;
            
            tablaClientes.appendChild(fila);
        });
        
        // Agregar eventos a los botones de editar y eliminar
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                cargarClienteParaEditar(id);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                confirmarEliminar(id);
            });
        });
    }

    /**
     * Carga los datos de un cliente para editar
     * @param {number} id - ID del cliente a editar
     */
    function cargarClienteParaEditar(id) {
        const cliente = clienteController.buscarPorId(id);
        
        if (cliente) {
            clienteId.value = cliente.getId();
            nombreInput.value = cliente.getNombre();
            emailInput.value = cliente.getEmail();
            telefonoInput.value = cliente.getTelefono();
            documentoInput.value = cliente.getDocumento();
            
            btnGuardar.textContent = 'Actualizar';
            btnCancelar.style.display = 'inline-block';
        } else {
            mostrarAlerta('No se encontró el cliente seleccionado', 'danger');
        }
    }

    /**
     * Muestra el modal de confirmación para eliminar un cliente
     * @param {number} id - ID del cliente a eliminar
     */
    function confirmarEliminar(id) {
        clienteIdEliminar = id;
        modal.style.display = 'flex';
    }

    /**
     * Elimina un cliente
     * @param {number} id - ID del cliente a eliminar
     */
    function eliminarCliente(id) {
        const resultado = clienteController.eliminar(id);
        
        if (resultado) {
            mostrarAlerta('Cliente eliminado con éxito', 'success');
            cargarClientes();
        } else {
            mostrarAlerta('No se pudo eliminar el cliente', 'danger');
        }
    }

    /**
     * Resetea el formulario a su estado inicial
     */
    function resetearFormulario() {
        formCliente.reset();
        clienteId.value = '';
        btnGuardar.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
    }

    /**
     * Muestra los errores de validación
     * @param {Object} errores - Objeto con los errores
     */
    function mostrarErrores(errores) {
        let mensaje = 'Por favor corrija los siguientes errores:<ul>';
        
        for (const campo in errores) {
            mensaje += `<li>${errores[campo]}</li>`;
        }
        
        mensaje += '</ul>';
        
        mostrarAlerta(mensaje, 'danger');
    }

    /**
     * Muestra un mensaje de alerta
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de alerta (success, danger, warning)
     */
    function mostrarAlerta(mensaje, tipo) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo}`;
        alert.innerHTML = mensaje;
        
        alertsContainer.innerHTML = '';
        alertsContainer.appendChild(alert);
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}); 