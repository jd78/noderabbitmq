const index = require('../lib/index')
const connectionManager = require('../lib/connection-manager')

let initialize = async () => {
    await index.initialize({
        serverUrl: 'amqp://localhost'
    })
    connectionManager.exchangeDeclare('test', 'fanout', true)
}

initialize()

