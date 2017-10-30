const index = require('../lib/index')
const connectionManager = require('../lib/connection-manager')

let handlers = new Map()
handlers.set('testType', require('./test-message-handler'))

let initialize = async () => {
    await index.initialize({
        serverUrl: 'amqp://localhost',
        publishConfirmation: true,
        prefetch: 1000,
        handlers: handlers
    })

    await connectionManager.initializeTopologyChannel([
        { op: 'exchangeDeclare', name: 'test', type: 'topic', durable: true },
        { op: 'queueDeclare', name: 'test.inbound', durable: true, autodelete: false, options: { "x-message-ttl": 20000 } },
        { op: 'queueBind', queueName: 'test.inbound', exchangeName: 'test', routingKey: '#' }
    ])

    await connectionManager.initializePublisher()

    connectionManager.startConsumer('test.inbound')

    for(let i=0; i<100;i++){
        let testObj = {
            id: i,
            name: 'pippo'
        }
        
        connectionManager.publish('test', 'testType', 'correlationId', 'key', JSON.stringify(testObj))
    }
}

initialize()