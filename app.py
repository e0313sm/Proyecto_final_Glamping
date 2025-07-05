# app.py
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
# VISTAS HTML
# -------------------------------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/clientes', methods=['GET', 'POST'])
def clientes():
    info = ''
    if request.method == 'POST':
        data = request.form
        cliente_controller.crear({
            'nombre': data['nombre'],
            'telefono': data['telefono'],
            'email': data['email'],
            'documento': data['documento']
        })
        info = "Cliente registrado correctamente"
    clientes = cliente_controller.obtener_todos()
    return render_template('clientes.html', clientes=clientes, info=info)

@app.route('/glampings', methods=['GET', 'POST'])
def glampings():
    info = ''
    if request.method == 'POST':
        data = request.form
        glamping_controller.crear({
            'nombre': data['nombre'],
            'capacidad': int(data['capacidad']),
            'precioPorNoche': float(data['precioPorNoche']),
            'caracteristicas': data['caracteristicas'].split(','),
            'disponible': data['disponible'].lower() == 'true'
        })
        info = "Glamping registrado correctamente"
    glampings = glamping_controller.obtener_todos()
    return render_template('glampings.html', glampings=glampings, info=info)

@app.route('/reservas', methods=['GET'])
def reservas():
    reservas = reserva_controller.obtener_todas()
    return render_template('reservas.html', reservas=reservas)

# -------------------------------
# API REST
# -------------------------------

# CLIENTES
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
    return jsonify(cliente_controller.crear(data))

@app.route('/api/clientes/<int:id>', methods=['PUT'])
def api_actualizar_cliente(id):
    data = request.get_json()
    return jsonify(cliente_controller.actualizar(id, data))

@app.route('/api/clientes/<int:id>', methods=['DELETE'])
def api_eliminar_cliente(id):
    return jsonify(cliente_controller.eliminar(id))

# GLAMPINGS
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
    return jsonify(glamping_controller.crear(data))

@app.route('/api/glampings/<int:id>', methods=['PUT'])
def api_actualizar_glamping(id):
    data = request.get_json()
    return jsonify(glamping_controller.actualizar(id, data))

@app.route('/api/glampings/<int:id>', methods=['DELETE'])
def api_eliminar_glamping(id):
    return jsonify(glamping_controller.eliminar(id))

# RESERVAS
@app.route('/api/reservas', methods=['GET'])
def api_listar_reservas():
    return jsonify(reserva_controller.obtener_todas())

@app.route('/api/reservas/<int:id>', methods=['GET'])
def api_obtener_reserva(id):
    reserva = reserva_controller.buscar_por_id(id)
    if reserva:
        return jsonify(reserva)
    return jsonify({'error': 'Reserva no encontrada'}), 404

@app.route('/api/reservas', methods=['POST'])
def api_crear_reserva():
    data = request.get_json()
    return jsonify(reserva_controller.crear(data))

@app.route('/api/reservas/<int:id>', methods=['PUT'])
def api_actualizar_reserva(id):
    data = request.get_json()
    return jsonify(reserva_controller.actualizar(id, data))

@app.route('/api/reservas/<int:id>', methods=['DELETE'])
def api_eliminar_reserva(id):
    return jsonify(reserva_controller.eliminar(id))

if __name__ == '__main__':
    app.run(debug=True)
