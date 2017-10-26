const amqp = require('amqplib/callback_api');
const configuration = require('./configuration')

let _isConnected
let _connection
let _configChannel

let connect = () =>
    new Promise((resolve, reject) => {
        if(_isConnected) return resolve()
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
                _isConnected = true
                resolve()    
            })
        })
    })

module.exports = {
    connect: connect,
    exchangeDeclare: (name, type, durable) => _configChannel.assertExchange(name, type, {durable:durable})
}
