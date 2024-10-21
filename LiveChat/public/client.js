const socket = io();

// Store the username for this client
let username = '';

// Event listener for 'assign username' message from the server
socket.on('assign username', (assignedUsername) => {
    username = assignedUsername; // Set the assigned username
    console.log(`You are ${username}`); // Output to console
});

// Function to send a message
function sendMessage() {
    const input = document.querySelector('.message-input');
    if (input.value.trim() !== '') { // Prevent sending empty messages
        socket.emit('chat message', input.value); // Emit the message to the server
        input.value = ''; // Clear the input field
    }
}

// Event listener for the "Send" button click
document.getElementsByClassName("sender")[0].addEventListener('click', () => {
    sendMessage();
});

// Event listener for the "Enter" key to send a message
document.querySelector('.message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (i.e., form submission)
        sendMessage();
    }
});

// Event listener for incoming 'chat message' messages from the server
socket.on('chat message', (msg) => {
    const messageContainer = document.querySelector('.messages');
    const newMessage = document.createElement('p');
    
    // Split the message into sender and actual message content
    const messageParts = msg.split(':');
    const sender = messageParts[0].trim();
    const messageText = messageParts.slice(1).join(':').trim(); // Handles multiple colons

    // Check if the message is from the current user, another user, or a system message
    if (sender === username) {
        newMessage.classList.add('message', 'my-message');
    } else if (sender.includes("the chat")) {
        newMessage.classList.add('message', 'joined-message');
    } else {
        newMessage.classList.add('message', 'other-message');
    }
    
    newMessage.textContent = msg; // Set the message content
    messageContainer.appendChild(newMessage); // Add the message to the chat box

    // Auto-scroll to the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;
});
