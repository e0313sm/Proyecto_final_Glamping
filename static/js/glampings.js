// glampings.js (corregido y funcional con fetch y API REST)
document.addEventListener('DOMContentLoaded', () => {
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

    cargarGlampings();

    formGlamping.addEventListener('submit', async e => {
        e.preventDefault();

        const data = {
            nombre: nombreInput.value,
            capacidad: parseInt(capacidadInput.value),
            precio_por_noche: parseInt(precioPorNocheInput.value),
            caracteristicas: caracteristicasInput.value.split(',').map(c => c.trim()),
            disponible: disponibleInput.value === 'true'
        };

        try {
            const method = glampingId.value ? 'PUT' : 'POST';
            const url = glampingId.value ? `/api/glampings/${glampingId.value}` : '/api/glampings';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Error al guardar el glamping');

            mostrarAlerta(`Glamping ${glampingId.value ? 'actualizado' : 'creado'} con éxito`, 'success');
            resetearFormulario();
            cargarGlampings();
        } catch (err) {
            mostrarAlerta(err.message, 'danger');
        }
    });

    btnCancelar.addEventListener('click', resetearFormulario);
    btnConfirmarEliminar.addEventListener('click', async () => {
        if (glampingIdEliminar) {
            try {
                const res = await fetch(`/api/glampings/${glampingIdEliminar}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('No se pudo eliminar');
                mostrarAlerta('Glamping eliminado con éxito', 'success');
                cargarGlampings();
            } catch (err) {
                mostrarAlerta(err.message, 'danger');
            } finally {
                modalConfirmar.style.display = 'none';
                glampingIdEliminar = null;
            }
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modalDetalles.style.display = 'none';
            modalConfirmar.style.display = 'none';
        });
    });

    async function cargarGlampings() {
        try {
            const res = await fetch('/api/glampings');
            const glampings = await res.json();
            renderizarGlampings(glampings);
        } catch (err) {
            mostrarAlerta('Error al cargar glampings', 'danger');
        }
    }

    function renderizarGlampings(glampings) {
        glampingCards.innerHTML = '';
        tablaGlampings.innerHTML = '';

        glampings.forEach(g => {
            const disponibleBadge = g.disponible ? '<span class="glamping-badge disponible">Disponible</span>' : '<span class="glamping-badge no-disponible">No disponible</span>';

            const card = document.createElement('div');
            card.className = 'glamping-card';
            card.innerHTML = `
                <div class="glamping-card-header"><h3>${g.nombre}</h3></div>
                <div class="glamping-card-body">
                    <p><strong>Capacidad:</strong> ${g.capacidad} personas</p>
                    <p><strong>Precio por noche:</strong> $${g.precio_por_noche.toLocaleString()}</p>
                    <p>${disponibleBadge}</p>
                </div>
                <div class="glamping-card-footer">
                    <button class="btn-detalles" data-id="${g.id}">Ver detalles</button>
                    <div>
                        <button class="btn-editar" data-id="${g.id}">Editar</button>
                        <button class="btn-eliminar danger" data-id="${g.id}">Eliminar</button>
                    </div>
                </div>`;
            glampingCards.appendChild(card);

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${g.id}</td>
                <td>${g.nombre}</td>
                <td>${g.capacidad}</td>
                <td>$${g.precio_por_noche.toLocaleString()}</td>
                <td>${g.disponible ? 'Sí' : 'No'}</td>
                <td class="action-buttons">
                    <button class="btn-detalles" data-id="${g.id}">Detalles</button>
                    <button class="btn-editar" data-id="${g.id}">Editar</button>
                    <button class="btn-eliminar danger" data-id="${g.id}">Eliminar</button>
                </td>`;
            tablaGlampings.appendChild(fila);
        });

        document.querySelectorAll('.btn-detalles').forEach(btn => btn.onclick = mostrarDetalles);
        document.querySelectorAll('.btn-editar').forEach(btn => btn.onclick = cargarParaEditar);
        document.querySelectorAll('.btn-eliminar').forEach(btn => btn.onclick = confirmarEliminar);
    }

    async function mostrarDetalles(e) {
        const id = e.target.dataset.id;
        try {
            const res = await fetch(`/api/glampings/${id}`);
            const g = await res.json();
            detallesGlamping.innerHTML = `
                <h3>${g.nombre}</h3>
                <p><strong>ID:</strong> ${g.id}</p>
                <p><strong>Capacidad:</strong> ${g.capacidad}</p>
                <p><strong>Precio por noche:</strong> $${g.precio_por_noche}</p>
                <p><strong>Disponible:</strong> ${g.disponible ? 'Sí' : 'No'}</p>
                <h4>Características:</h4>
                <ul>${g.caracteristicas.map(c => `<li>${c}</li>`).join('')}</ul>`;
            modalDetalles.style.display = 'flex';
        } catch (err) {
            mostrarAlerta('Error al obtener detalles', 'danger');
        }
    }

    async function cargarParaEditar(e) {
        const id = e.target.dataset.id;
        try {
            const res = await fetch(`/api/glampings/${id}`);
            const g = await res.json();
            glampingId.value = g.id;
            nombreInput.value = g.nombre;
            capacidadInput.value = g.capacidad;
            precioPorNocheInput.value = g.precio_por_noche;
            caracteristicasInput.value = g.caracteristicas.join(', ');
            disponibleInput.value = g.disponible.toString();
            btnGuardar.textContent = 'Actualizar';
            btnCancelar.style.display = 'inline-block';
        } catch (err) {
            mostrarAlerta('Error al cargar glamping para editar', 'danger');
        }
    }

    function confirmarEliminar(e) {
        glampingIdEliminar = e.target.dataset.id;
        modalConfirmar.style.display = 'flex';
    }

    function resetearFormulario() {
        formGlamping.reset();
        glampingId.value = '';
        btnGuardar.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
    }

    function mostrarAlerta(mensaje, tipo) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo}`;
        alert.innerHTML = mensaje;
        alertsContainer.innerHTML = '';
        alertsContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }
});
