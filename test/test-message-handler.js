const lib = require('../lib/index')

let asyncLog = m => new Promise((resolve, reject) => {
    var randomnumber = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    setTimeout(() => {
        console.log(m)
        resolve()
    }, randomnumber)
})

module.exports = async (message, header) => {
    await asyncLog(message)

    //throw lib.rejectMessageError

    //console.log(message)
}