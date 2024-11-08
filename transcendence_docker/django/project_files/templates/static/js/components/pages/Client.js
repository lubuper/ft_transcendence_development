export function setupChat(friendName, userName) {
    const messageContainer = document.getElementById(`messages-${userName}-${friendName}`);

    const chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${userName}/${friendName}/`);

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const newMessage = document.createElement('p');
        newMessage.textContent = `${data.sender} : ${data.message}`;
        if (data.sender === userName) {
            newMessage.classList.add('my-message');
        } else if (data.sender === friendName) {
            newMessage.classList.add('friend-message');
        }
        messageContainer.appendChild(newMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    chatSocket.onclose = function() {
        console.log('Chat socket closed');
    };

    chatSocket.onerror = function(e) {
        console.error('Chat socket error', e);
    };

    const senderButton = document.querySelector(`.sender`);
    const inputField = document.querySelector(`.message-input`);

    if (senderButton && inputField) {
        senderButton.addEventListener('click', () => {
            if (inputField.value.trim() !== '') {
                chatSocket.send(JSON.stringify({ 'message': inputField.value }));
                inputField.value = ''; // Clear the input field after sending
            }
        });

        inputField.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                senderButton.click();
                console.log('Message sent');
            }
        });
    }
}
