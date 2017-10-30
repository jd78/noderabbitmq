const configuration = require("./configuration")

module.exports = {
	initialize: async conf => {
		if (conf) {
			if (!conf.serverUrl) { throw new Error('Server url is needed') }
            configuration.serverUrl = conf.serverUrl
            
			if (conf.errorLog)
                configuration.errorLog = conf.errorLog
            
            if(conf.persistentMessages)
                configuration.persistentMessages = conf.persistentMessages
            
            if(conf.publishConfirmation)
                configuration.publishConfirmation = conf.publishConfirmation

            if(conf.consumerAck)
                configuration.consumerAck = conf.consumerAck
            
            if(conf.prefetch)
                configuration.prefetch = conf.prefetch
            
            if(conf.consumeInSequence)
                configuration.consumeInSequence = conf.consumeInSequence
            
            if(conf.handlers)
                configuration.handlers = conf.handlers
        }
        
        await require('./connection-manager').connect()
	}
}