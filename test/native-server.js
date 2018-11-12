const SocketIO = require('socket.io')
const io = SocketIO()

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
})

io.listen(2030, () => {
    console.log('Listening on port 2030...')
})