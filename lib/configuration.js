let defaults = {
    timeout: 6000,
    errorLog: console.log,
    persistentMessages: false,
    publishConfirmation: true
}

let _serverUrl
let _errorLog //high order function with single parameter of type string
let _persistentMessages
let _publishConfirmation

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
    
    get publishConfirmation() {
        if(_publishConfirmation) return _publishConfirmation
        return defaults.publishConfirmation
	}

	set publishConfirmation(b) {
		_publishConfirmation = b
	}
}

module.exports = new Configuration()