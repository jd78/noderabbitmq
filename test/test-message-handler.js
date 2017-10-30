let asyncLog = m => new Promise((resolve, reject) => {
    var randomnumber = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    setTimeout(() => {
        console.log(m)
        resolve()
    }, randomnumber)
})

module.exports = async (message, header) => {
    await asyncLog(message)
    //console.log(message)
}