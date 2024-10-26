const socket = io('http://localhost:3000');

export function setupChat(friendName) {
    const messageContainer = document.getElementById(`messages-${friendName}`);
    
    socket.on('chat message', (msg) => {
        const newMessage = document.createElement('p');
        newMessage.textContent = msg;
        messageContainer.appendChild(newMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });

    document.addEventListener("DOMContentLoaded", () => {
        const senderButton = document.querySelector('.sender');
        senderButton.addEventListener('click', () => {
            const input = document.querySelector('.message-input');
            if (input && input.value.trim() !== '') {
                socket.emit('chat message', input.value);
                input.value = '';
            }
        });
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
    });
}
