const index = require('../lib/index')
const connectionManager = require('../lib/connection-manager')

let handlers = new Map()
handlers.set('testType', require('./test-message-handler'))

let initialize = async () => {
    await index.initialize({
        serverUrl: 'amqp://localhost',
        publishConfirmation: true,
        handlers: handlers
    })

    await connectionManager.initializeTopologyChannel()

    connectionManager.exchangeDeclare('test', 'topic', true)
    connectionManager.queueDeclare('test.inbound', true, false, {"x-message-ttl" : 20000})
    connectionManager.queueBind('test.inbound', 'test', '#')

    await connectionManager.initializePublisher()

    connectionManager.startConsumer('test.inbound')

    let testObj = {
        name: 'pippo'
    }

    connectionManager.publish('test', 'testType', 'correlationId', 'key', JSON.stringify(testObj))
}

initialize()