document.addEventListener('DOMContentLoaded', () => {
    cargarReservas();
    cargarClientes();
    cargarGlampings();

    document.getElementById('form-reserva').addEventListener('submit', function (e) {
        e.preventDefault();
        agregarReserva();
    });
});

// Cargar lista de reservas
function cargarReservas() {
    fetch('/api/reservas')
        .then(response => response.json())
        .then(reservas => {
            const tbody = document.querySelector('#tabla-reservas tbody');
            tbody.innerHTML = '';

            reservas.forEach(reserva => {
                const fila = document.createElement('tr');

                fila.innerHTML = `
                    <td>${reserva.id}</td>
                    <td>${reserva.cliente_id}</td>
                    <td>${reserva.glamping_id}</td>
                    <td>${reserva.fecha_inicio}</td>
                    <td>${reserva.fecha_fin}</td>
                    <td>${reserva.total_pagado || 0}</td>
                    <td>${reserva.estado}</td>
                    <td>
                        <button onclick="verDetalles(${reserva.id})">Ver</button>
                        <button onclick="eliminarReserva(${reserva.id})">Eliminar</button>
                        <button onclick="cambiarEstado(${reserva.id})">Cambiar Estado</button>
                    </td>
                `;

                tbody.appendChild(fila);
            });
        })
        .catch(error => {
            console.error('Error al cargar reservas:', error);
        });
}

// Cargar lista de clientes en selects
function cargarClientes() {
    fetch('/api/clientes')
        .then(res => res.json())
        .then(clientes => {
            const selectCliente = document.getElementById('cliente');
            const filtroCliente = document.getElementById('filtro-cliente');

            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = `${cliente.nombre} ${cliente.apellido}`;
                selectCliente.appendChild(option);

                const filtroOption = option.cloneNode(true);
                filtroCliente.appendChild(filtroOption);
            });
        })
        .catch(error => {
            console.error('Error al cargar clientes:', error);
        });
}

// Cargar lista de glampings en selects
function cargarGlampings() {
    fetch('/api/glampings')
        .then(res => res.json())
        .then(glampings => {
            const selectGlamping = document.getElementById('glamping');
            const filtroGlamping = document.getElementById('filtro-glamping');

            glampings.forEach(glamping => {
                const option = document.createElement('option');
                option.value = glamping.id;
                option.textContent = glamping.nombre;
                selectGlamping.appendChild(option);

                const filtroOption = option.cloneNode(true);
                filtroGlamping.appendChild(filtroOption);
            });
        })
        .catch(error => {
            console.error('Error al cargar glampings:', error);
        });
}

// Agregar nueva reserva
function agregarReserva() {
    const data = {
        cliente_id: parseInt(document.getElementById('cliente').value),
        glamping_id: parseInt(document.getElementById('glamping').value),
        fecha_inicio: document.getElementById('fechaInicio').value,
        fecha_fin: document.getElementById('fechaFin').value,
        total_pagado: parseFloat(document.getElementById('totalPagado').value || 0),
        estado: document.getElementById('estado').value
    };

    fetch('/api/reservas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById('form-reserva').reset();
            cargarReservas();
            alert('Reserva agregada con éxito');
        })
        .catch(error => {
            console.error('Error al agregar reserva:', error);
        });
}

// Eliminar reserva
function eliminarReserva(id) {
    if (!confirm('¿Seguro que deseas eliminar esta reserva?')) return;

    fetch(`/api/reservas/${id}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(() => {
            alert('Reserva eliminada');
            cargarReservas();
        })
        .catch(error => {
            console.error('Error al eliminar:', error);
        });
}

// Ver detalles de reserva
function verDetalles(id) {
    fetch(`/api/reservas/${id}`)
        .then(res => res.json())
        .then(reserva => {
            const modal = document.getElementById('modal-detalles');
            const body = modal.querySelector('#detalles-reserva');

            body.innerHTML = `
                <p><strong>ID:</strong> ${reserva.id}</p>
                <p><strong>Cliente ID:</strong> ${reserva.cliente_id}</p>
                <p><strong>Glamping ID:</strong> ${reserva.glamping_id}</p>
                <p><strong>Fecha Inicio:</strong> ${reserva.fecha_inicio}</p>
                <p><strong>Fecha Fin:</strong> ${reserva.fecha_fin}</p>
                <p><strong>Total Pagado:</strong> ${reserva.total_pagado}</p>
                <p><strong>Estado:</strong> ${reserva.estado}</p>
            `;
            modal.style.display = 'block';
        });
}

// Cambiar estado de reserva
function cambiarEstado(id) {
    const nuevoEstado = prompt('Ingrese el nuevo estado (ej. confirmada, cancelada, pendiente):');
    if (!nuevoEstado) return;

    fetch(`/api/reservas/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
    })
        .then(res => res.json())
        .then(() => {
            alert('Estado actualizado');
            cargarReservas();
        })
        .catch(error => {
            console.error('Error al cambiar estado:', error);
        });
}

// Cerrar cualquier modal
function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}
