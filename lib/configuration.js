let defaults = {
    timeout: 6000,
    errorLog: console.log
}

let _serverUrl
let _errorLog //high order function with single parameter of type string

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
}

module.exports = new Configuration()