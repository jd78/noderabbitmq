let _hasBeenExecuted

class ExecuteOnce {

    execute(f) {
        if(_hasBeenExecuted) return;
        let res = f()
        _hasBeenExecuted = true
        return res
    }
}

module.exports = ExecuteOnce