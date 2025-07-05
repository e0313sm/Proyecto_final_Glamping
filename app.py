from flask import Flask, render_template, request, jsonify
from controller.ClienteController import ClienteController
from controller.GlampingController import GlampingController
from controller.ReservaController import ReservaController

app = Flask(__name__)

# Instancias de los controladores
cliente_controller = ClienteController()
glamping_controller = GlampingController()
reserva_controller = ReservaController()

# -------------------------------
# VISTAS HTML (para render_template)
# -------------------------------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/clientes', methods=['GET', 'POST'])
def clientes():
    info = ''
    if request.method == 'POST':
        nombre = request.form['nombre']
        telefono = request.form['telefono']
        email = request.form['email']
        documento = request.form['documento']
        cliente_controller.crear({
            'nombre': nombre,
            'telefono': telefono,
            'email': email,
            'documento': documento
        })
        info = "Cliente registrado correctamente"
    clientes = cliente_controller.obtener_todos()
    return render_template('clientes.html', clientes=clientes, info=info)

@app.route('/glampings', methods=['GET', 'POST'])
def glampings():
    info = ''
    if request.method == 'POST':
        nombre = request.form['nombre']
        capacidad = request.form['capacidad']
        precio = request.form['precioPorNoche']
        caracteristicas = request.form['caracteristicas'].split(',')  # Separar por coma
        disponible = request.form['disponible'].lower() == 'true'
        glamping_controller.crear({
            'nombre': nombre,
            'capacidad': capacidad,
            'precioPorNoche': precio,
            'caracteristicas': caracteristicas,
            'disponible': disponible
        })
        info = "Glamping registrado correctamente"
    glampings = glamping_controller.obtener_todos()
    return render_template('glampings.html', glampings=glampings, info=info)

@app.route('/reservas', methods=['GET', 'POST'])
def reservas():
    info = ''
    if request.method == 'POST':
        cliente_id = request.form['cliente']
        glamping_id = request.form['glamping']
        fecha_inicio = request.form['fechaInicio']
        fecha_fin = request.form['fechaFin']
        total_pagado = request.form.get('totalPagado', 0)
        estado = request.form['estado']

        reserva_controller.crear({
            'cliente_id': cliente_id,
            'glamping_id': glamping_id,
            'fecha_inicio': fecha_inicio,
            'fecha_fin': fecha_fin,
            'total_pagado': total_pagado,
            'estado': estado
        })
        info = "Reserva registrada correctamente"
    reservas = reserva_controller.obtener_todas()
    return render_template('reservas.html', reservas=reservas, info=info)

# -------------------------------
# API REST para conexión con fetch()
# -------------------------------

# -------- CLIENTES --------
@app.route('/api/clientes', methods=['GET'])
def api_listar_clientes():
    return jsonify(cliente_controller.obtener_todos())

@app.route('/api/clientes/<int:id>', methods=['GET'])
def api_obtener_cliente(id):
    cliente = cliente_controller.buscar_por_id(id)
    if cliente:
        return jsonify(cliente)
    return jsonify({'error': 'Cliente no encontrado'}), 404

@app.route('/api/clientes', methods=['POST'])
def api_crear_cliente():
    data = request.get_json()
    resultado = cliente_controller.crear(data)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado)

@app.route('/api/clientes/<int:id>', methods=['PUT'])
def api_actualizar_cliente(id):
    data = request.get_json()
    resultado = cliente_controller.actualizar(id, data)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado)

@app.route('/api/clientes/<int:id>', methods=['DELETE'])
def api_eliminar_cliente(id):
    resultado = cliente_controller.eliminar(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado)

# -------- GLAMPINGS --------
@app.route('/api/glampings', methods=['GET'])
def api_listar_glampings():
    return jsonify(glamping_controller.obtener_todos())

@app.route('/api/glampings/<int:id>', methods=['GET'])
def api_obtener_glamping(id):
    glamping = glamping_controller.buscar_por_id(id)
    if glamping:
        return jsonify(glamping)
    return jsonify({'error': 'Glamping no encontrado'}), 404

@app.route('/api/glampings', methods=['POST'])
def api_crear_glamping():
    data = request.get_json()
    resultado = glamping_controller.crear(data)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado)

@app.route('/api/glampings/<int:id>', methods=['PUT'])
def api_actualizar_glamping(id):
    data = request.get_json()
    resultado = glamping_controller.actualizar(id, data)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado)

@app.route('/api/glampings/<int:id>', methods=['DELETE'])
def api_eliminar_glamping(id):
    resultado = glamping_controller.eliminar(id)
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
    return jsonify(resultado)

# -------------------------------
if __name__ == '__main__':
    app.run(debug=True)
