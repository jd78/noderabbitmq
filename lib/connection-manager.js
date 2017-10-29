const amqp = require('amqplib/callback_api');
const configuration = require('./configuration')

let _isConnected
let _connection
let _configChannel
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

let initializeTopologyChannel = () => new Promise((resolve, reject) => {
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
        _configChannel = ch
        resolve()
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

module.exports = {
    connect: connect,
    initializeTopologyChannel: initializeTopologyChannel,
    initializePublisher: initializePublisher,
    exchangeDeclare: (name, type, durable) => _configChannel.assertExchange(name, type, { durable: durable }),
    queueDeclare: (name, durable, autodelete, options) => _configChannel.assertQueue(name, { durable: durable, autoDelete: autodelete, arguments: options }),
    queueBind: (queueName, exchangeName, routingKey) => _configChannel.bindQueue(queueName, exchangeName, routingKey),
    publish: publish
}
