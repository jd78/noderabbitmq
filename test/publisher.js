const index = require('../lib/index')
const connectionManager = require('../lib/connection-manager')

let initialize = async () => {
    await index.initialize({
        serverUrl: 'amqp://localhost',
        publishConfirmation: true,
    })

    await connectionManager.initializeTopologyChannel([
        { op: 'exchangeDeclare', name: 'test', type: 'topic', durable: true }
    ])

    await connectionManager.initializePublisher()

    for(let i=0; i<100;i++){
        let testObj = {
            id: i,
            name: 'pippo'
        }
        
        connectionManager.publish('test', 'testType', 'correlationId', 'key', JSON.stringify(testObj))
    }
}

initialize()