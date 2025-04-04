import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ChatBot from './chatbot';
import path from 'path';

const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    new ChatBot(socket);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});