# Live Chat Application

This project is a simple live chat application built using HTML, CSS, JavaScript, and Node.js with Socket.io for real-time communication. Users can connect to the chat room, send messages, and see messages from other users in real-time.

## Features
- Real-time messaging using WebSockets (via Socket.io)
- Basic user interface with retro styling
- Automated username assignment based on user connections
- Notifications for user join and leave events

## Project Structure

- `index.html`: The main HTML page that contains the chat interface and friends list.
- `style.css`: The CSS file that provides retro-style design for the chat interface.
- `client.js`: The client-side JavaScript that handles sending and receiving messages through Socket.io.
- `server.js`: The Node.js server using Express and Socket.io to manage WebSocket connections and handle messages.
- `public/`: Folder that holds all static files (HTML, CSS, and client-side JS).

## How It Works

1. **Server (Node.js + Socket.io)**:
   - The server listens for client connections via Socket.io.
   - When a user connects, a unique username (`user1`, `user2`, etc.) is assigned to them.
   - Messages sent by users are broadcast to all connected clients, including a notification when users join or leave the chat.

2. **Client (HTML + JavaScript)**:
   - The client interface allows users to send and view chat messages in real-time.
   - Users can type a message in the input field and click "SEND" to transmit the message.
   - Messages from the same user are styled differently than messages from others.
   - System messages (e.g., user joined or left) are displayed in a different style.

## Getting Started

### Prerequisites
- Node.js installed on your machine
- Basic understanding of JavaScript and WebSockets

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/live-chat

2. Navigate to the project folder:
   ```bash
   cd live-chat

3. Install dependencies:
   ```bash
   npm install

4. Start the server:
   ```bash
   node server.js

5. Open a browser and go to:
   ```bash
   http://localhost:3000
