let defaults = {
    timeout: 6000,
    errorLog: console.log,
    persistentMessages: false,
    publishConfirmation: true,
    consumerAck: true,
    prefetch: 1,
    consumeInSequence: true,
    handlers: new Map(),
}

let _serverUrl
let _errorLog //high order function with single parameter of type string
let _persistentMessages
let _publishConfirmation
let _consumerAck
let _prefetch
let _consumeInSequence
let _handlers //map of string (type of message) module to execute

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

    get consumerAck() {
        if(_consumerAck) return _consumerAck
        return defaults.consumerAck
	}

	set consumerAck(b) {
		_consumerAck = b
    }

    get prefetch() {
        if(_prefetch) return _prefetch
        return defaults.prefetch
	}

	set prefetch(n) {
		_prefetch = n
    }

    get consumeInSequence() {
        if(_consumeInSequence) return _consumeInSequence
        return defaults._consumeInSequence
	}

	set consumeInSequence(b) {
		_consumeInSequence = b
    }
    
    get handlers() {
        if(_handlers) return _handlers
        return defaults.handlers
	}

	set handlers(handlersMap) {
		_handlers = handlersMap
	}
}

module.exports = new Configuration()