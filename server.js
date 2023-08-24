const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const activeUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('request-username');

    socket.on('set-username', (username) => {
        activeUsers[socket.id] = username;

        io.emit('active-users', Object.values(activeUsers));
        io.emit('online-users-count', Object.keys(activeUsers).length); // Emit online users count

        socket.on('disconnect', () => {
            delete activeUsers[socket.id];
            io.emit('active-users', Object.values(activeUsers));
            io.emit('online-users-count', Object.keys(activeUsers).length); // Update online users count
            console.log('A user disconnected');
        });

        socket.on('chat-message', (msg) => {
            const user = activeUsers[socket.id];
            io.emit('chat-message', { user, msg });
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

