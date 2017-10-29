const amqp = require('amqplib/callback_api');
const configuration = require('./configuration')
const _ = require('underscore')

let _isConnected
let _connection
let _publishChannel

let connect = () =>
    new Promise((resolve, reject) => {
        if (_isConnected) return resolve()
        _isConnected = true
        amqp.connect(configuration.serverUrl, (err, conn) => {
            if (err) {
                configuration.errorLog(err)
                reject(err)
            }
            _connection = conn
            resolve()
        })
    })

let assertExchange = (ch, name, type, durable) => new Promise((resolve, reject) => {
    ch.assertExchange(name, type, { durable: durable }, (err, _) => {
        if(err) return reject(err)
        resolve()
    })
})  

let assertQueue = (ch, name, durable, autodelete, options) => new Promise((resolve, reject) => {
    ch.assertQueue(name, { durable: durable, autoDelete: autodelete, arguments: options }, (err, _) => {
        if (err) return reject(err)
        resolve()
    })
})

let queueBind = (ch, qName, eName, routingKey) => new Promise((resolve, reject) => {
    ch.bindQueue(qName, eName, routingKey, null, (err, _) => {
        if (err) return reject(err)
        resolve()
    })
})

let initializeTopologyChannel = t => new Promise((resolve, reject) => {
    if (!_connection) {
        let err = "Connection not initialized"
        configuration.errorLog(err)
        reject(err)
    }
    _connection.createChannel((err, ch) => {
        if (err) {
            configuration.errorLog(err)
            reject(err)
        }

        Promise.all(_.map(t, e => {
            switch (e.op){
                case 'exchangeDeclare':
                    return assertExchange(ch, e.name, e.type, e.durable)
                case 'queueDeclare':
                    return assertQueue(ch, e.name, e.durable, e.autodelete, e.options)
                case 'queueBind':
                    return queueBind(ch, e.queueName, e.exchangeName, e.routingKey)
                default:
                    throw new Error('unknown operation in topology')
            }
        })).then(_ => {
            ch.close()
            resolve()
        })
    })
})

let initializePublisher = () => new Promise((resolve, reject) => {
    if (!_connection) {
        let err = "Connection not initialized"
        configuration.errorLog(err)
        reject(err)
    }
    if (configuration.publishConfirmation) {
        _connection.createConfirmChannel((err, ch) => {
            if (err) {
                configuration.errorLog(err)
                reject(err)
            }
            _publishChannel = ch
            resolve()
        })
    } else {
        _connection.createChannel((err, ch) => {
            if (err) {
                configuration.errorLog(err)
                reject(err)
            }
            _publishChannel = ch
            resolve()
        })
    }
})

let publish = (exchangeName, type, correlationId, routingKey, message, headers) => _publishChannel.publish(exchangeName, routingKey, new Buffer(message),
    {
        persistent: configuration.persistentMessages,
        type: type,
        correlationId: correlationId,
        headers: headers
    }, (err, _) => {
        if (err) {
            configuration.errorLog(err)
            throw new Error(err)
        }
    })

let startConsumer = queue => {
    if (!_connection) {
        let err = "Connection not initialized"
        configuration.errorLog(err)
        throw err
    }
    _connection.createChannel((err, ch) => {
        if(err){
            configuration.errorLog(err)
            throw err
        }
        ch.consume(
            queue, 
            message => {
                let tryAck = () => {if(configuration.consumerAck) ch.ack(message)}
                if(!configuration.handlers.has(message.properties.type)){
                    tryAck()
                    return
                }
                let h = configuration.handlers.get(message.properties.type)
                try {
                    h(JSON.parse(message.content.toString()), message.properties.headers)
                    tryAck()
                }catch(e){
                    configuration.errorLog({correlationId: message.properties.correlationId, exception: e})
                    throw e
                }
            },
            {noAck: !configuration.consumerAck}
        )    
    })
}

module.exports = {
    connect: connect,
    initializeTopologyChannel: t => initializeTopologyChannel(t),
    initializePublisher: initializePublisher,
    publish: publish,
    startConsumer : startConsumer
}
