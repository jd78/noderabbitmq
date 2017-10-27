const index = require('../lib/index')
const connectionManager = require('../lib/connection-manager')

let initialize = async () => {
    await index.initialize({
        serverUrl: 'amqp://localhost'
    })
    connectionManager.exchangeDeclare('test', 'topic', true)
    connectionManager.queueDeclare('test.inbound', true, false, {"x-message-ttl" : 20000})
    connectionManager.queueBind('test.inbound', 'test', '#')

    connectionManager.publish('test', null, null, 'key', 'some message')
}

initialize()