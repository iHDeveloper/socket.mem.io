const SocketMemIO = require('./../index')
const io = new SocketMemIO.Server()

io.on('connection', (socket) => {

    socket.on('request', () => {
        console.log('Request received from the client')
        socket.emit('response')
    })

    socket.on('heartbeat', () => {
        socket.emit('heartbeat')
        console.log('Successfully tested the server! with native socket.io')
    })

    socket.emit('connect')
    console.log('Someone connected!')
})

io.listen(2030)
console.log('Listening on port 2030...')