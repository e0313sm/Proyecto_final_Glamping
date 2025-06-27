/**
 * Script para la gestión de glampings integrado con el controlador
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const formGlamping = document.getElementById('form-glamping');
    const glampingId = document.getElementById('glamping-id');
    const nombreInput = document.getElementById('nombre');
    const capacidadInput = document.getElementById('capacidad');
    const precioPorNocheInput = document.getElementById('precioPorNoche');
    const caracteristicasInput = document.getElementById('caracteristicas');
    const disponibleInput = document.getElementById('disponible');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaGlampings = document.getElementById('tabla-glampings').querySelector('tbody');
    const glampingCards = document.getElementById('glamping-cards');
    const modalDetalles = document.getElementById('modal-detalles');
    const detallesGlamping = document.getElementById('detalles-glamping');
    const modalConfirmar = document.getElementById('modal-confirmar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    const alertsContainer = document.getElementById('alerts-container');
    
    let glampingIdEliminar = null;
    
    // Instanciar el controlador de glampings
    const glampingController = new GlampingController();

    // Cargar glampings al iniciar
    cargarGlampings();

    // Evento para guardar o actualizar glamping
    formGlamping.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const datosGlamping = {
            nombre: nombreInput.value,
            capacidad: capacidadInput.value,
            precioPorNoche: precioPorNocheInput.value,
            caracteristicas: caracteristicasInput.value.split(',').map(c => c.trim()).filter(c => c),
            disponible: disponibleInput.value === 'true'
        };
        
        try {
            // Validar datos
            const errores = glampingController.validar(datosGlamping);
            if (Object.keys(errores).length > 0) {
                mostrarErrores(errores);
                return;
            }
            
            if (glampingId.value) {
                // Actualizar glamping existente
                const glampingActualizado = glampingController.actualizar(parseInt(glampingId.value), datosGlamping);
                if (glampingActualizado) {
                    mostrarAlerta('Glamping actualizado con éxito', 'success');
                    resetearFormulario();
                    cargarGlampings();
                } else {
                    mostrarAlerta('No se encontró el glamping a actualizar', 'danger');
                }
            } else {
                // Crear nuevo glamping
                glampingController.crear(datosGlamping);
                mostrarAlerta('Glamping creado con éxito', 'success');
                resetearFormulario();
                cargarGlampings();
            }
        } catch (error) {
            mostrarAlerta('Error: ' + error.message, 'danger');
        }
    });

    // Evento para cancelar edición
    btnCancelar.addEventListener('click', resetearFormulario);

    // Cerrar modales cuando se hace clic en el botón de cerrar
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            modalDetalles.style.display = 'none';
            modalConfirmar.style.display = 'none';
        });
    });

    // Confirmar eliminación
    btnConfirmarEliminar.addEventListener('click', function() {
        if (glampingIdEliminar) {
            eliminarGlamping(glampingIdEliminar);
            modalConfirmar.style.display = 'none';
            glampingIdEliminar = null;
        }
    });

    /**
     * Carga la lista de glampings desde el controlador
     */
    function cargarGlampings() {
        const glampings = glampingController.obtenerTodos();
        renderizarGlampings(glampings);
    }

    /**
     * Renderiza la lista de glampings en tarjetas y en la tabla
     * @param {Array} glampings - Lista de glampings a mostrar
     */
    function renderizarGlampings(glampings) {
        // Limpiar el contenedor de tarjetas y la tabla
        glampingCards.innerHTML = '';
        tablaGlampings.innerHTML = '';
        
        glampings.forEach(glamping => {
            // Crear tarjeta
            const card = document.createElement('div');
            card.className = 'glamping-card';
            
            const disponibleBadge = glamping.isDisponible() ? 
                '<span class="glamping-badge disponible">Disponible</span>' : 
                '<span class="glamping-badge no-disponible">No disponible</span>';
            
            card.innerHTML = `
                <div class="glamping-card-header">
                    <h3>${glamping.getNombre()}</h3>
                </div>
                <div class="glamping-card-body">
                    <p><strong>Capacidad:</strong> ${glamping.getCapacidad()} personas</p>
                    <p><strong>Precio por noche:</strong> $${glamping.getPrecioPorNoche().toLocaleString()}</p>
                    <p>${disponibleBadge}</p>
                </div>
                <div class="glamping-card-footer">
                    <button class="btn-detalles" data-id="${glamping.getId()}">Ver detalles</button>
                    <div>
                        <button class="btn-editar" data-id="${glamping.getId()}">Editar</button>
                        <button class="btn-eliminar danger" data-id="${glamping.getId()}">Eliminar</button>
                    </div>
                </div>
            `;
            
            glampingCards.appendChild(card);
            
            // Crear fila en la tabla
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${glamping.getId()}</td>
                <td>${glamping.getNombre()}</td>
                <td>${glamping.getCapacidad()}</td>
                <td>$${glamping.getPrecioPorNoche().toLocaleString()}</td>
                <td>${glamping.isDisponible() ? 'Sí' : 'No'}</td>
                <td class="action-buttons">
                    <button class="btn-detalles" data-id="${glamping.getId()}">Detalles</button>
                    <button class="btn-editar" data-id="${glamping.getId()}">Editar</button>
                    <button class="btn-eliminar danger" data-id="${glamping.getId()}">Eliminar</button>
                </td>
            `;
            
            tablaGlampings.appendChild(fila);
        });
        
        // Agregar eventos a los botones
        // Botones de detalles
        document.querySelectorAll('.btn-detalles').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                mostrarDetalles(id);
            });
        });
        
        // Botones de editar
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                cargarGlampingParaEditar(id);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                confirmarEliminar(id);
            });
        });
    }

    /**
     * Muestra los detalles de un glamping
     * @param {number} id - ID del glamping
     */
    function mostrarDetalles(id) {
        const glamping = glampingController.buscarPorId(id);
        
        if (glamping) {
            // Obtener las reservas de este glamping
            const reservaController = new ReservaController();
            const reservas = reservaController.obtenerReservasGlamping(id);
            
            detallesGlamping.innerHTML = `
                <h3>${glamping.getNombre()}</h3>
                <p><strong>ID:</strong> ${glamping.getId()}</p>
                <p><strong>Capacidad:</strong> ${glamping.getCapacidad()} personas</p>
                <p><strong>Precio por noche:</strong> $${glamping.getPrecioPorNoche().toLocaleString()}</p>
                <p><strong>Disponible:</strong> ${glamping.isDisponible() ? 'Sí' : 'No'}</p>
                <h4>Características:</h4>
                <ul>
                    ${glamping.getCaracteristicas().map(c => `<li>${c}</li>`).join('')}
                </ul>
                <h4>Reservas (${reservas.length})</h4>
                ${reservas.length > 0 ? 
                    `<ul>${reservas.map(r => 
                        `<li>Del ${formatearFecha(r.getFechaInicio())} al ${formatearFecha(r.getFechaFin())} - Estado: ${r.getEstado()}</li>`
                    ).join('')}</ul>` : 
                    '<p>No hay reservas para este glamping</p>'}
            `;
            
            modalDetalles.style.display = 'flex';
        } else {
            mostrarAlerta('No se encontró el glamping seleccionado', 'danger');
        }
    }

    /**
     * Carga los datos de un glamping para editar
     * @param {number} id - ID del glamping a editar
     */
    function cargarGlampingParaEditar(id) {
        const glamping = glampingController.buscarPorId(id);
        
        if (glamping) {
            glampingId.value = glamping.getId();
            nombreInput.value = glamping.getNombre();
            capacidadInput.value = glamping.getCapacidad();
            precioPorNocheInput.value = glamping.getPrecioPorNoche();
            caracteristicasInput.value = glamping.getCaracteristicas().join(', ');
            disponibleInput.value = glamping.isDisponible().toString();
            
            btnGuardar.textContent = 'Actualizar';
            btnCancelar.style.display = 'inline-block';
        } else {
            mostrarAlerta('No se encontró el glamping seleccionado', 'danger');
        }
    }

    /**
     * Muestra el modal de confirmación para eliminar un glamping
     * @param {number} id - ID del glamping a eliminar
     */
    function confirmarEliminar(id) {
        // Primero verificar si tiene reservas asociadas
        const reservaController = new ReservaController();
        const reservas = reservaController.obtenerReservasGlamping(id);
        
        if (reservas.length > 0) {
            mostrarAlerta(`No se puede eliminar el glamping porque tiene ${reservas.length} reservas asociadas.`, 'danger');
            return;
        }
        
        glampingIdEliminar = id;
        modalConfirmar.style.display = 'flex';
    }

    /**
     * Elimina un glamping
     * @param {number} id - ID del glamping a eliminar
     */
    function eliminarGlamping(id) {
        const resultado = glampingController.eliminar(id);
        
        if (resultado) {
            mostrarAlerta('Glamping eliminado con éxito', 'success');
            cargarGlampings();
        } else {
            mostrarAlerta('No se pudo eliminar el glamping', 'danger');
        }
    }

    /**
     * Resetea el formulario a su estado inicial
     */
    function resetearFormulario() {
        formGlamping.reset();
        glampingId.value = '';
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
    
    /**
     * Formatea una fecha en formato YYYY-MM-DD a formato local
     */
    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES');
    }
}); 