/**
 * Script para inicializar datos de prueba en localStorage si no existen
 */
function initializeData() {
    // Verificar si ya hay datos en localStorage
    if (!localStorage.getItem('clientes') && !localStorage.getItem('glampings') && !localStorage.getItem('reservas')) {
        console.log('Inicializando datos de prueba en localStorage...');
        
        // Datos de clientes
        const clientes = [
            {
                id: 1,
                nombre: 'Juan Pérez',
                email: 'juan@ejemplo.com',
                telefono: '3001234567',
                documento: '12345678'
            },
            {
                id: 2,
                nombre: 'María López',
                email: 'maria@ejemplo.com',
                telefono: '3109876543',
                documento: '87654321'
            },
            {
                id: 3,
                nombre: 'Carlos Rodríguez',
                email: 'carlos@ejemplo.com',
                telefono: '3201112233',
                documento: '11223344'
            }
        ];
        
        // Datos de glampings
        const glampings = [
            {
                id: 1,
                nombre: 'Cabaña del Bosque',
                capacidad: 4,
                precioPorNoche: 200000,
                caracteristicas: ['WiFi', 'Chimenea', 'Vista al bosque', 'Cocina equipada'],
                disponible: true
            },
            {
                id: 2,
                nombre: 'Domo Estrella',
                capacidad: 2,
                precioPorNoche: 150000,
                caracteristicas: ['Techo transparente', 'Jacuzzi', 'Desayuno incluido'],
                disponible: true
            },
            {
                id: 3,
                nombre: 'Tienda Safari',
                capacidad: 6,
                precioPorNoche: 300000,
                caracteristicas: ['Terraza', 'Baño privado', 'Cerca del lago', 'Hamacas'],
                disponible: true
            }
        ];
        
        // Fecha de hoy y mañana para las reservas
        const hoy = new Date();
        const fechaInicio = hoy.toISOString().split('T')[0];
        
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        const fechaFin = manana.toISOString().split('T')[0];
        
        // Crear una reserva de ejemplo
        const reservas = [
            {
                id: 1,
                clienteId: 1, // Juan Pérez
                glampingId: 2, // Domo Estrella
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                totalPagado: 150000,
                estado: 'confirmada'
            }
        ];
        
        // Guardar datos en localStorage
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('glampings', JSON.stringify(glampings));
        localStorage.setItem('reservas', JSON.stringify(reservas));
        
        console.log('Datos de prueba inicializados correctamente.');
    } else {
        console.log('Ya existen datos en localStorage, no se inicializarán datos de prueba.');
    }
}

// Ejecutar la inicialización al cargar la página
document.addEventListener('DOMContentLoaded', initializeData); 