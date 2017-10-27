const amqp = require('amqplib/callback_api');
const configuration = require('./configuration')

let _isConnected
let _connection
let _configChannel
let _publishChannel

let connect = () =>
    new Promise((resolve, reject) => {
        if(_isConnected) return resolve()
        _isConnected = true
        amqp.connect(configuration.serverUrl, (err, conn) => {
            if(err) {
                configuration.errorLog(err)
                reject(err)
            }
            _connection = conn
            conn.createChannel((err, ch) => {
                if(err) {
                    configuration.errorLog(err)
                    reject(err)
                }
                _configChannel = ch
            })
            conn.createChannel((err, ch) => {
                if(err) {
                    configuration.errorLog(err)
                    reject(err)
                }
                _publishChannel = ch
                resolve()    
            })
        })
    })

module.exports = {
    connect: connect,
    exchangeDeclare: (name, type, durable) => _configChannel.assertExchange(name, type, {durable:durable}),
    queueDeclare: (name, durable, autodelete, options) => _configChannel.assertQueue(name, {durable:durable, autoDelete: autodelete, arguments: options}),
    queueBind: (queueName, exchangeName, routingKey) => _configChannel.bindQueue(queueName, exchangeName, routingKey),
    publish: (exchangeName, type, correlationId, routingKey, message) => _publishChannel.publish(exchangeName, routingKey, new Buffer(message), {persistent: configuration.persistentMessages})
}
