class ForceRequeueMessageError extends Error { }

class RejectMessageError extends Error { }

module.exports = {
    forceRequeueMessageError: new ForceRequeueMessageError(),
    rejectMessageError: new RejectMessageError()
}