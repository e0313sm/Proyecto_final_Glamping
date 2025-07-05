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

    cargarClientes();

    formCliente.addEventListener('submit', async function(e) {
        e.preventDefault();

        const datosCliente = {
            nombre: nombreInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            documento: documentoInput.value
        };

        try {
            if (clienteId.value) {
                // PUT (actualizar cliente)
                const response = await fetch(`/api/clientes/${clienteId.value}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosCliente)
                });
                const data = await response.json();

                if (response.ok) {
                    mostrarAlerta('Cliente actualizado con éxito', 'success');
                    resetearFormulario();
                    cargarClientes();
                } else {
                    mostrarErrores(data.errores || { error: 'No se pudo actualizar el cliente' });
                }
            } else {
                // POST (crear nuevo cliente)
                const response = await fetch('/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosCliente)
                });
                const data = await response.json();

                if (response.ok) {
                    mostrarAlerta('Cliente creado con éxito', 'success');
                    resetearFormulario();
                    cargarClientes();
                } else {
                    mostrarErrores(data.errores || { error: 'No se pudo crear el cliente' });
                }
            }
        } catch (error) {
            mostrarAlerta('Error: ' + error.message, 'danger');
        }
    });

    btnCancelar.addEventListener('click', resetearFormulario);

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    btnConfirmarEliminar.addEventListener('click', function() {
        if (clienteIdEliminar) {
            eliminarCliente(clienteIdEliminar);
            modal.style.display = 'none';
            clienteIdEliminar = null;
        }
    });

    async function cargarClientes() {
        try {
            const response = await fetch('/api/clientes');
            const clientes = await response.json();
            renderizarClientes(clientes);
        } catch (error) {
            mostrarAlerta('Error al cargar clientes', 'danger');
        }
    }

    function renderizarClientes(clientes) {
        tablaClientes.innerHTML = '';

        clientes.forEach(cliente => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.documento}</td>
                <td class="action-buttons">
                    <button class="btn-editar" data-id="${cliente.id}">Editar</button>
                    <button class="btn-eliminar danger" data-id="${cliente.id}">Eliminar</button>
                </td>
            `;

            tablaClientes.appendChild(fila);
        });

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

    async function cargarClienteParaEditar(id) {
        try {
            const response = await fetch(`/api/clientes/${id}`);
            const cliente = await response.json();

            if (response.ok) {
                clienteId.value = cliente.id;
                nombreInput.value = cliente.nombre;
                emailInput.value = cliente.email;
                telefonoInput.value = cliente.telefono;
                documentoInput.value = cliente.documento;

                btnGuardar.textContent = 'Actualizar';
                btnCancelar.style.display = 'inline-block';
            } else {
                mostrarAlerta('Cliente no encontrado', 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error al obtener cliente', 'danger');
        }
    }

    function confirmarEliminar(id) {
        clienteIdEliminar = id;
        modal.style.display = 'flex';
    }

    async function eliminarCliente(id) {
        try {
            const response = await fetch(`/api/clientes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                mostrarAlerta('Cliente eliminado con éxito', 'success');
                cargarClientes();
            } else {
                mostrarAlerta('No se pudo eliminar el cliente', 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error al eliminar cliente', 'danger');
        }
    }

    function resetearFormulario() {
        formCliente.reset();
        clienteId.value = '';
        btnGuardar.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
    }

    function mostrarErrores(errores) {
        let mensaje = 'Por favor corrija los siguientes errores:<ul>';

        for (const campo in errores) {
            mensaje += `<li>${errores[campo]}</li>`;
        }

        mensaje += '</ul>';
        mostrarAlerta(mensaje, 'danger');
    }

    function mostrarAlerta(mensaje, tipo) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo}`;
        alert.innerHTML = mensaje;

        alertsContainer.innerHTML = '';
        alertsContainer.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});
