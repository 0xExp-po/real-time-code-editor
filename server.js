const express = require('express')
const app = express();
const http = require('http');
const path = require('path');

const server = http.createServer(app);

const {Server}  = require('socket.io');
const ACTIONS = require('./src/Action');

const io = new Server(server);

app.use(express.static('build'));
app.use((req,res,next)=>{

    res.sendFile(path.join(__dirname,'build','index.html'));
})


const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
        console.log('SYNC CODE',code);
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

    socket.on("typing",({username})=>{
        socket.broadcast.emit("typing",{username:username});
        console.log('Server:',username);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{
  
      console.log(`Listening on PORT ${PORT}`);
});