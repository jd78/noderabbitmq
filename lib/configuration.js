let defaults = {
    timeout: 6000,
    errorLog: console.log,
    persistentMessages: false
}

let _serverUrl
let _errorLog //high order function with single parameter of type string
let _persistentMessages

class Configuration {
	get serverUrl() {
		return _serverUrl
	}

	set serverUrl(url) {
		_serverUrl = url
    }
    
    get errorLog() {
        if(_errorLog) return _errorLog
        return defaults.errorLog
	}

	set errorLog(e) {
		_errorLog = e
    }
    
    get persistentMessages() {
        if(_persistentMessages) return _persistentMessages
        return defaults.persistentMessages
	}

	set persistentMessages(b) {
		_persistentMessages = b
	}
}

module.exports = new Configuration()