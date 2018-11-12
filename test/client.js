const client = require('socket.io-client')
const io = client('http://localhost:2030')

io.on('connect', () => {
    console.log('Connected!')
    io.emit('request')
})

io.on('response', () => {
    console.log('Recieved a response from the server')
    io.emit('heartbeat')
})

io.on('heartbeat', () => {
    console.log('Successfully test the native client.')
})

io.on('disconnect', () => {
    console.log('Disconnected! Re-connecting...')
})

console.log('Connecting...')