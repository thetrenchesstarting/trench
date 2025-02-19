/* server/server.js */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('../client'));

const players = {};
const bullets = [];

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    players[socket.id] = { x: 0, z: 0 };
    io.emit('updatePlayers', players);

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].z = data.z;
            io.emit('updatePlayers', players);
        }
    });
    
    socket.on('shoot', (data) => {
        const bullet = { x: data.x, z: data.z, id: socket.id };
        bullets.push(bullet);
        io.emit('spawnBullet', bullet);
    });
    
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
