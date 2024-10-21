const express = require('express'); // Import express module
const http = require('http'); // Node.js HTTP module
const { Server } = require('socket.io'); // Import Socket.io for real-time communication
const path = require('path'); // Path utility

const app = express(); // Initialize express app
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server); // Initialize Socket.io with the HTTP server

// Serve the static files (HTML, CSS, client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

// Counter to assign unique usernames to connected users
let userCount = 0;

// Handle new socket connection
io.on('connection', (socket) => {
    userCount++; // Increment the user count for unique usernames
    const username = `user${userCount}`; // Assign a unique username
    console.log(`${username} connected`);

    // Emit the username to the connected client
    socket.emit('assign username', username);

    // Broadcast a message to all clients when a new user joins
    io.emit('chat message', `${username} has joined the chat`);

    // Listen for chat messages from the client
    socket.on('chat message', (msg) => {
        io.emit('chat message', `${username}: ${msg}`); // Broadcast the message to all clients
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log(`${username} disconnected`);
        io.emit('chat message', `${username} has left the chat`);
    });
});


const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
