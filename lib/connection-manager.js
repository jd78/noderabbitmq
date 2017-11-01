const amqp = require('amqplib');
const configuration = require('./configuration')
const _ = require('underscore')
const processorQueue = require('./queue')

let _isConnected
let _connection
let _publishChannel

let connect = () =>
    new Promise((resolve, reject) => {
        if (_isConnected) return resolve()
        _isConnected = true
        amqp.connect(configuration.serverUrl).then(conn => {
            conn.on('error', (err) => {
                configuration.errorLog(err)
                throw new Error(err)
            })
            _connection = conn

            resolve()
        }).catch(err => {
            configuration.errorLog(err)
            reject(err)
        })
    })

let assertExchange = (ch, name, type, durable, autodelete) => new Promise((resolve, reject) => {
    ch.assertExchange(name, type, { durable: durable, autodelete:autodelete }).then(() => resolve()).catch(err => reject(err))
})

let bindExchange = (ch, destination, source, routingKey) => new Promise((resolve, reject) => {
    ch.bindExchange(destination, source, routingKey).then(() => resolve()).catch(err => reject(err))
})

let assertQueue = (ch, name, durable, autodelete, exclusive, options) => new Promise((resolve, reject) => {
    ch.assertQueue(name, { durable: durable, autoDelete: autodelete, exclusive: exclusive, arguments: options }).then(() => resolve()).catch(err => reject(err))
})

let queueBind = (ch, qName, eName, routingKey) => new Promise((resolve, reject) => {
    ch.bindQueue(qName, eName, routingKey, null).then(() => resolve()).catch(err => reject(err))
})

let initializeTopologyChannel = t => new Promise((resolve, reject) => {
    if (!_connection) {
        let err = "Connection not initialized"
        configuration.errorLog(err)
        reject(err)
    }
    _connection.createChannel().then(ch => {
        Promise.all(_.map(t, e => {
            switch (e.op) {
                case 'exchangeDeclare':
                    return assertExchange(ch, e.name, e.type, e.durable, e.autodelete)
                case 'exchangeBind':
                    return bindExchange(ch, e.destination, e.source, e.routingKey)
                case 'queueDeclare':
                    return assertQueue(ch, e.name, e.durable, e.autodelete, e.exclusive, e.options)
                case 'queueBind':
                    return queueBind(ch, e.queueName, e.exchangeName, e.routingKey)
                default:
                    throw new Error('unknown operation in topology')
            }
        })).then(_ => {
            ch.close()
            resolve()
        }).catch(err => {
            configuration.errorLog(err)
            reject(err)
        })
    }).catch(err => {
        configuration.errorLog(err)
        reject(err)
    })
})

let initializePublisher = () => new Promise((resolve, reject) => {
    if (!_connection) {
        let err = "Connection not initialized"
        configuration.errorLog(err)
        reject(err)
    }
    if (configuration.publishConfirmation) {
        _connection.createConfirmChannel().then(ch => {
            _publishChannel = ch
            resolve()
        }).catch(err => {
            configuration.errorLog(err)
            reject(err)
        })
    } else {
        _connection.createChannel().then(ch => {
            _publishChannel = ch
            resolve()
        }).catch(err => {
            configuration.errorLog(err)
            reject(err)
        })
    }
})

let publish = (exchangeName, type, correlationId, routingKey, message, headers) => _publishChannel.publish(exchangeName, routingKey, new Buffer(message),
    {
        persistent: configuration.persistentMessages,
        type: type,
        correlationId: correlationId,
        timestamp: new Date().getTime(),
        headers: headers
    }, (err, _) => {
        if (err) {
            configuration.errorLog(err)
            throw new Error(err)
        }
    })

let processorQueueRunning
let startConsumer = queue => {
    if (!_connection) {
        let err = "Connection not initialized"
        configuration.errorLog(err)
        throw err
    }

    if (configuration.consumeInSequence && !processorQueueRunning) {
        processorQueue.processQueue()
        processorQueueRunning = true
    }
    _connection.createChannel().then(ch => {
        ch.prefetch(configuration.prefetch, false)
        ch.consume(
            queue,
            message => {
                let tryAck = () => { if (configuration.consumerAck) ch.ack(message) }
                let tryNack = () => { if (configuration.consumerAck) ch.nack(message) }
                if (!configuration.handlers.has(message.properties.type)) {
                    tryAck()
                    return
                }
                let h = configuration.handlers.get(message.properties.type)

                if (configuration.consumeInSequence) {
                    processorQueue.push(() => new Promise((resolve, reject) => {
                        h(JSON.parse(message.content.toString()), message.properties.headers)
                            .then(() => {
                                tryAck()
                                resolve()
                            }).catch(e => {
                                configuration.errorLog({ correlationId: message.properties.correlationId, exception: e })
                                process.exit(1)
                            })
                    }))
                } else {
                    h(JSON.parse(message.content.toString()), message.properties.headers)
                        .then(() => tryAck())
                        .catch(e => {
                            configuration.errorLog({ correlationId: message.properties.correlationId, exception: e })
                            tryNack()
                        })
                }

            },
            { noAck: !configuration.consumerAck }
        )
    }).catch(err => {
        configuration.errorLog(err)
        throw err
    })
}

module.exports = {
    connect: connect,
    initializeTopologyChannel: t => initializeTopologyChannel(t),
    initializePublisher: initializePublisher,
    publish: publish,
    startConsumer: startConsumer
}
