from bottle import Bottle, run, template, static_file, request

app = Bottle()


@app.route('/')
def index():
    return template('index', title='Bottle App')


@app.route('/hello/<name>')
def hello(name):
    return template('hello', name=name)


@app.route('/static/<filepath:path>')
def static(filepath):
    return static_file(filepath, root='static')


if __name__ == '__main__':
    run(app, host='0.0.0.0', port=8080, debug=True)
