const index = require('../lib/index')
const connectionManager = require('../lib/connection-manager')

index.initialize({
    serverUrl: 'amqp://localhost'
}).then(() => {
    connectionManager.exchangeDeclare('test', 'fanout', true)
})

