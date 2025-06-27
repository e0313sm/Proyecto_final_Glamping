/**
 * Script para la gestión de reservas integrado con el controlador
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const formReserva = document.getElementById('form-reserva');
    const reservaId = document.getElementById('reserva-id');
    const clienteSelect = document.getElementById('cliente');
    const glampingSelect = document.getElementById('glamping');
    const fechaInicioInput = document.getElementById('fechaInicio');
    const fechaFinInput = document.getElementById('fechaFin');
    const totalPagadoInput = document.getElementById('totalPagado');
    const estadoSelect = document.getElementById('estado');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaReservas = document.getElementById('tabla-reservas').querySelector('tbody');
    const filtroCliente = document.getElementById('filtro-cliente');
    const filtroGlamping = document.getElementById('filtro-glamping');
    const filtroEstado = document.getElementById('filtro-estado');
    const formFiltros = document.getElementById('form-filtros');
    const calendarioReservas = document.getElementById('calendario-reservas');
    const modalDetalles = document.getElementById('modal-detalles');
    const detallesReserva = document.getElementById('detalles-reserva');
    const modalConfirmar = document.getElementById('modal-confirmar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    const modalEstado = document.getElementById('modal-estado');
    const cambioEstadoSelect = document.getElementById('cambio-estado');
    const btnConfirmarEstado = document.getElementById('btn-confirmar-estado');
    const alertsContainer = document.getElementById('alerts-container');
    
    let reservaIdEliminar = null;
    let reservaIdCambioEstado = null;
    
    // Instanciar controladores
    const reservaController = new ReservaController();
    const clienteController = new ClienteController();
    const glampingController = new GlampingController();
    
    // Inicializar la aplicación
    inicializar();
    
    function inicializar() {
        // Cargar datos necesarios
        cargarClientes();
        cargarGlampings();
        cargarReservas();
        
        // Configurar eventos
        configurarEventos();
        
        // Inicializar calendario
        generarCalendario(new Date());
    }
    
    function configurarEventos() {
        // Evento para crear/actualizar reserva
        formReserva.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarReserva();
        });
        
        // Evento para cancelar edición
        btnCancelar.addEventListener('click', resetearFormulario);
        
        // Eventos para modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                modalDetalles.style.display = 'none';
                modalConfirmar.style.display = 'none';
                modalEstado.style.display = 'none';
            });
        });
        
        // Confirmar eliminación
        btnConfirmarEliminar.addEventListener('click', function() {
            if (reservaIdEliminar) {
                eliminarReserva(reservaIdEliminar);
                modalConfirmar.style.display = 'none';
            }
        });
        
        // Confirmar cambio de estado
        btnConfirmarEstado.addEventListener('click', function() {
            if (reservaIdCambioEstado) {
                cambiarEstadoReserva(reservaIdCambioEstado, cambioEstadoSelect.value);
                modalEstado.style.display = 'none';
            }
        });
        
        // Filtros
        formFiltros.addEventListener('submit', function(e) {
            e.preventDefault();
            aplicarFiltros();
        });
        
        formFiltros.addEventListener('reset', function() {
            setTimeout(() => {
                cargarReservas();
            }, 10);
        });
        
        // Calcular total automáticamente al cambiar fechas
        fechaInicioInput.addEventListener('change', calcularTotalAutomatico);
        fechaFinInput.addEventListener('change', calcularTotalAutomatico);
        glampingSelect.addEventListener('change', calcularTotalAutomatico);
    }
    
    function cargarClientes() {
        // Cargar todos los clientes desde el controlador
        const clientes = clienteController.obtenerTodos();
        
        // Llenar selects de clientes
        llenarSelect(clienteSelect, clientes, cliente => ({
            value: cliente.getId(),
            text: cliente.getNombre()
        }));
        
        llenarSelect(filtroCliente, clientes, cliente => ({
            value: cliente.getId(),
            text: cliente.getNombre()
        }));
    }
    
    function cargarGlampings() {
        // Cargar todos los glampings disponibles desde el controlador
        const glampings = glampingController.obtenerDisponibles();
        
        // Llenar selects de glampings
        llenarSelect(glampingSelect, glampings, glamping => ({
            value: glamping.getId(),
            text: glamping.getNombre()
        }));
        
        // Para el filtro, incluir todos los glampings, no solo los disponibles
        const todosGlampings = glampingController.obtenerTodos();
        llenarSelect(filtroGlamping, todosGlampings, glamping => ({
            value: glamping.getId(),
            text: glamping.getNombre()
        }));
    }
    
    function cargarReservas() {
        // Cargar todas las reservas desde el controlador
        const reservas = reservaController.obtenerTodas();
        renderizarReservas(reservas);
    }
    
    function llenarSelect(select, items, mapperFn) {
        // Mantener la primera opción (vacía)
        const primeraOpcion = select.options[0];
        select.innerHTML = '';
        select.appendChild(primeraOpcion);
        
        // Agregar opciones
        items.forEach(item => {
            const { value, text } = mapperFn(item);
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        });
    }
    
    function renderizarReservas(reservas) {
        tablaReservas.innerHTML = '';
        
        reservas.forEach(reserva => {
            const cliente = reserva.getCliente();
            const glamping = reserva.getGlamping();
            
            const fila = document.createElement('tr');
            
            // Generar clases de estado para estilos
            const estadoClass = `estado-${reserva.getEstado()}`;
            
            fila.innerHTML = `
                <td>${reserva.getId()}</td>
                <td>${cliente ? cliente.getNombre() : 'Cliente no encontrado'}</td>
                <td>${glamping ? glamping.getNombre() : 'Glamping no encontrado'}</td>
                <td>${formatearFecha(reserva.getFechaInicio())}</td>
                <td>${formatearFecha(reserva.getFechaFin())}</td>
                <td>$${reserva.getTotalPagado().toLocaleString()}</td>
                <td><span class="estado-badge ${estadoClass}">${reserva.getEstado()}</span></td>
                <td class="action-buttons">
                    <button class="btn-detalles" data-id="${reserva.getId()}">Detalles</button>
                    <button class="btn-editar" data-id="${reserva.getId()}">Editar</button>
                    <button class="btn-estado" data-id="${reserva.getId()}">Estado</button>
                    <button class="btn-eliminar danger" data-id="${reserva.getId()}">Eliminar</button>
                </td>
            `;
            
            tablaReservas.appendChild(fila);
        });
        
        // Agregar eventos a los botones
        document.querySelectorAll('.btn-detalles').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                mostrarDetalles(id);
            });
        });
        
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                cargarReservaParaEditar(id);
            });
        });
        
        document.querySelectorAll('.btn-estado').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                mostrarModalCambioEstado(id);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                confirmarEliminar(id);
            });
        });
        
        // Actualizar calendario
        renderizarReservasEnCalendario(reservas);
    }
    
    function mostrarDetalles(id) {
        const reserva = reservaController.buscarPorId(id);
        if (!reserva) {
            mostrarAlerta('No se encontró la reserva seleccionada', 'danger');
            return;
        }
        
        const cliente = reserva.getCliente();
        const glamping = reserva.getGlamping();
        const duracion = reserva.calcularDuracion();
        const precioTotal = reserva.calcularPrecioTotal();
        
        detallesReserva.innerHTML = `
            <h3>Reserva #${reserva.getId()}</h3>
            <p><strong>Cliente:</strong> ${cliente ? cliente.getNombre() : 'Cliente no encontrado'}</p>
            <p><strong>Documento:</strong> ${cliente ? cliente.getDocumento() : 'N/A'}</p>
            <p><strong>Email:</strong> ${cliente ? cliente.getEmail() : 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${cliente ? cliente.getTelefono() : 'N/A'}</p>
            <hr>
            <p><strong>Glamping:</strong> ${glamping ? glamping.getNombre() : 'Glamping no encontrado'}</p>
            <p><strong>Capacidad:</strong> ${glamping ? glamping.getCapacidad() + ' personas' : 'N/A'}</p>
            <p><strong>Precio por noche:</strong> $${glamping ? glamping.getPrecioPorNoche().toLocaleString() : 'N/A'}</p>
            <hr>
            <p><strong>Fecha de inicio:</strong> ${formatearFecha(reserva.getFechaInicio())}</p>
            <p><strong>Fecha de fin:</strong> ${formatearFecha(reserva.getFechaFin())}</p>
            <p><strong>Duración:</strong> ${duracion} días</p>
            <p><strong>Precio total calculado:</strong> $${precioTotal.toLocaleString()}</p>
            <p><strong>Total pagado:</strong> $${reserva.getTotalPagado().toLocaleString()}</p>
            <p><strong>Estado:</strong> <span class="estado-badge estado-${reserva.getEstado()}">${reserva.getEstado()}</span></p>
        `;
        
        modalDetalles.style.display = 'flex';
    }
    
    function cargarReservaParaEditar(id) {
        const reserva = reservaController.buscarPorId(id);
        if (!reserva) {
            mostrarAlerta('No se encontró la reserva seleccionada', 'danger');
            return;
        }
        
        reservaId.value = reserva.getId();
        clienteSelect.value = reserva.getClienteId();
        glampingSelect.value = reserva.getGlampingId();
        fechaInicioInput.value = reserva.getFechaInicio();
        fechaFinInput.value = reserva.getFechaFin();
        totalPagadoInput.value = reserva.getTotalPagado();
        estadoSelect.value = reserva.getEstado();
        
        btnGuardar.textContent = 'Actualizar';
        btnCancelar.style.display = 'inline-block';
        
        // Desplazar hacia el formulario
        formReserva.scrollIntoView({ behavior: 'smooth' });
    }
    
    function mostrarModalCambioEstado(id) {
        const reserva = reservaController.buscarPorId(id);
        if (!reserva) {
            mostrarAlerta('No se encontró la reserva seleccionada', 'danger');
            return;
        }
        
        reservaIdCambioEstado = id;
        cambioEstadoSelect.value = reserva.getEstado();
        modalEstado.style.display = 'flex';
    }
    
    function confirmarEliminar(id) {
        reservaIdEliminar = id;
        modalConfirmar.style.display = 'flex';
    }
    
    function guardarReserva() {
        const datosReserva = {
            clienteId: clienteSelect.value,
            glampingId: glampingSelect.value,
            fechaInicio: fechaInicioInput.value,
            fechaFin: fechaFinInput.value,
            totalPagado: totalPagadoInput.value,
            estado: estadoSelect.value
        };
        
        try {
            // Validar datos
            const errores = reservaController.validar(datosReserva);
            if (Object.keys(errores).length > 0) {
                mostrarErrores(errores);
                return;
            }
            
            // Verificar disponibilidad si es necesario
            if (!reservaId.value) {
                // Es una nueva reserva, verificar disponibilidad
                if (!reservaController.verificarDisponibilidad(
                    datosReserva.glampingId, 
                    datosReserva.fechaInicio, 
                    datosReserva.fechaFin
                )) {
                    mostrarAlerta('El glamping no está disponible para las fechas seleccionadas', 'danger');
                    return;
                }
            }
            
            if (reservaId.value) {
                // Actualizar
                const reservaActualizada = reservaController.actualizar(parseInt(reservaId.value), datosReserva);
                if (reservaActualizada) {
                    mostrarAlerta('Reserva actualizada con éxito', 'success');
                    resetearFormulario();
                    cargarReservas();
                } else {
                    mostrarAlerta('No se encontró la reserva a actualizar', 'danger');
                }
            } else {
                // Crear
                reservaController.crear(datosReserva);
                mostrarAlerta('Reserva creada con éxito', 'success');
                resetearFormulario();
                cargarReservas();
            }
        } catch (error) {
            mostrarAlerta('Error: ' + error.message, 'danger');
        }
    }
    
    function cambiarEstadoReserva(id, nuevoEstado) {
        try {
            const reservaActualizada = reservaController.actualizarEstado(id, nuevoEstado);
            if (reservaActualizada) {
                mostrarAlerta('Estado de reserva actualizado con éxito', 'success');
                cargarReservas();
            } else {
                mostrarAlerta('No se encontró la reserva a actualizar', 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error: ' + error.message, 'danger');
        }
    }
    
    function eliminarReserva(id) {
        const resultado = reservaController.eliminar(id);
        
        if (resultado) {
            mostrarAlerta('Reserva eliminada con éxito', 'success');
            cargarReservas();
        } else {
            mostrarAlerta('No se pudo eliminar la reserva', 'danger');
        }
        
        reservaIdEliminar = null;
    }
    
    function aplicarFiltros() {
        let reservasFiltradas = reservaController.obtenerTodas();
        
        // Filtrar por cliente
        if (filtroCliente.value) {
            const clienteId = parseInt(filtroCliente.value);
            reservasFiltradas = reservaController.obtenerReservasCliente(clienteId);
        }
        
        // Filtrar por glamping
        if (filtroGlamping.value) {
            const glampingId = parseInt(filtroGlamping.value);
            reservasFiltradas = reservaController.obtenerReservasGlamping(glampingId);
        }
        
        // Filtrar por estado
        if (filtroEstado.value) {
            reservasFiltradas = reservaController.obtenerReservasPorEstado(filtroEstado.value);
        }
        
        renderizarReservas(reservasFiltradas);
    }
    
    function generarCalendario(fecha) {
        calendarioReservas.innerHTML = '';
        
        const año = fecha.getFullYear();
        const mes = fecha.getMonth();
        
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Cabecera del calendario
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
            <h4>${nombresMeses[mes]} ${año}</h4>
            <div class="calendar-controls">
                <button id="prev-month">&lt;</button>
                <button id="today">Hoy</button>
                <button id="next-month">&gt;</button>
            </div>
        `;
        calendarioReservas.appendChild(header);
        
        // Control de navegación
        document.getElementById('prev-month').addEventListener('click', () => {
            const nuevaFecha = new Date(año, mes - 1, 1);
            generarCalendario(nuevaFecha);
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            const nuevaFecha = new Date(año, mes + 1, 1);
            generarCalendario(nuevaFecha);
        });
        
        document.getElementById('today').addEventListener('click', () => {
            generarCalendario(new Date());
        });
        
        // Días de la semana
        const weekDays = document.createElement('div');
        weekDays.className = 'calendar-weekdays';
        
        diasSemana.forEach(dia => {
            const weekday = document.createElement('div');
            weekday.className = 'weekday';
            weekday.textContent = dia;
            weekDays.appendChild(weekday);
        });
        
        calendarioReservas.appendChild(weekDays);
        
        // Primer día del mes
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        
        // Días del mes anterior para rellenar la primera semana
        const primerDiaSemana = primerDia.getDay();
        const diasMesAnterior = primerDiaSemana;
        
        // Días del mes actual
        const diasMes = ultimoDia.getDate();
        
        // Total de días a mostrar
        const totalDias = diasMesAnterior + diasMes;
        const totalSemanas = Math.ceil(totalDias / 7);
        
        // Generar los días
        let fecha_actual = new Date(año, mes, 1 - diasMesAnterior);
        
        for (let i = 0; i < totalSemanas * 7; i++) {
            const esOtroMes = fecha_actual.getMonth() !== mes;
            const esHoy = esMismaFecha(fecha_actual, new Date());
            
            const day = document.createElement('div');
            day.className = `calendar-day${esOtroMes ? ' other-month' : ''}${esHoy ? ' today' : ''}`;
            day.setAttribute('data-date', formatoFechaISO(fecha_actual));
            
            day.innerHTML = `<div class="day-number" data-weekday="${diasSemana[fecha_actual.getDay()]}">${fecha_actual.getDate()}</div>`;
            
            calendarioReservas.appendChild(day);
            
            fecha_actual.setDate(fecha_actual.getDate() + 1);
        }
        
        // Mostrar reservas en el calendario
        renderizarReservasEnCalendario(reservaController.obtenerTodas());
    }
    
    function renderizarReservasEnCalendario(reservas) {
        // Limpiar reservas anteriores
        document.querySelectorAll('.calendar-day .reservation').forEach(el => el.remove());
        
        // Restaurar clases
        document.querySelectorAll('.calendar-day.reserved').forEach(el => {
            el.classList.remove('reserved');
        });
        
        // Añadir reservas al calendario
        reservas.forEach(reserva => {
            const fechaInicio = new Date(reserva.getFechaInicio());
            const fechaFin = new Date(reserva.getFechaFin());
            
            const cliente = reserva.getCliente();
            const glamping = reserva.getGlamping();
            
            // Iterar cada día de la reserva
            const fechaActual = new Date(fechaInicio);
            while (fechaActual <= fechaFin) {
                const fechaISO = formatoFechaISO(fechaActual);
                const diaElement = document.querySelector(`.calendar-day[data-date="${fechaISO}"]`);
                
                if (diaElement) {
                    // Marcar como día reservado
                    diaElement.classList.add('reserved');
                    
                    // Añadir información de la reserva
                    const resInfo = document.createElement('div');
                    resInfo.className = `reservation estado-${reserva.getEstado()}`;
                    resInfo.textContent = `${cliente ? cliente.getNombre() : 'Cliente'} - ${glamping ? glamping.getNombre() : 'Glamping'}`;
                    resInfo.setAttribute('data-id', reserva.getId());
                    
                    resInfo.addEventListener('click', () => {
                        mostrarDetalles(reserva.getId());
                    });
                    
                    diaElement.appendChild(resInfo);
                }
                
                // Avanzar al siguiente día
                fechaActual.setDate(fechaActual.getDate() + 1);
            }
        });
    }
    
    function calcularTotalAutomatico() {
        if (fechaInicioInput.value && fechaFinInput.value && glampingSelect.value) {
            const inicio = new Date(fechaInicioInput.value);
            const fin = new Date(fechaFinInput.value);
            
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
                return;
            }
            
            const glampingId = parseInt(glampingSelect.value);
            const glamping = glampingController.buscarPorId(glampingId);
            
            if (glamping) {
                const duracion = calcularDuracion(fechaInicioInput.value, fechaFinInput.value);
                const total = duracion * glamping.getPrecioPorNoche();
                totalPagadoInput.value = total;
            }
        }
    }
    
    function mostrarErrores(errores) {
        let mensaje = 'Por favor corrija los siguientes errores:<ul>';
        
        for (const campo in errores) {
            mensaje += `<li>${errores[campo]}</li>`;
        }
        
        mensaje += '</ul>';
        
        mostrarAlerta(mensaje, 'danger');
    }
    
    function resetearFormulario() {
        formReserva.reset();
        reservaId.value = '';
        btnGuardar.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
    }
    
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
    
    // Funciones auxiliares
    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES');
    }
    
    function formatoFechaISO(fecha) {
        return fecha.toISOString().split('T')[0];
    }
    
    function calcularDuracion(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diferenciaTiempo = fin.getTime() - inicio.getTime();
        return Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    }
    
    function esMismaFecha(fecha1, fecha2) {
        return fecha1.getFullYear() === fecha2.getFullYear() &&
               fecha1.getMonth() === fecha2.getMonth() &&
               fecha1.getDate() === fecha2.getDate();
    }
}); 