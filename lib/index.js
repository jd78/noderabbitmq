const configuration = require("./configuration")

module.exports = {
	initialize: async conf => {
		if (conf) {
			if (!conf.serverUrl) { throw new Error('Server url is needed') }
            configuration.serverUrl = conf.serverUrl
            
			if (conf.errorLog)
				configuration.errorLog = conf.errorLog
        }
        
        await require('./connection-manager').connect()
	}
}