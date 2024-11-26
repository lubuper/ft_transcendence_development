/* const activeSockets = {}; // Store active WebSocket connections globally

export function setupChat(friendName, userName) {
    // Generate a consistent key for chat pairs regardless of order
    const chatKey = [userName, friendName].sort().join('-'); // Ensures consistent key (e.g., "rafa-ze" or "ze-rafa")

    // Check if a WebSocket already exists for this chatKey
    if (activeSockets[chatKey]) {
        console.log(`Reusing existing WebSocket for chat between ${userName} and ${friendName}`);
        return activeSockets[chatKey]; // Reuse the existing WebSocket
    }

    console.log(`Creating new WebSocket for chat between ${userName} and ${friendName}`);
    // Create the WebSocket connection
    const chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${userName}/${friendName}/`);
    activeSockets[chatKey] = chatSocket; // Store the WebSocket in the global object

    // Create the message container dynamically if it doesn't exist
    let messageContainer = document.getElementById(`messages-${chatKey}`);
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = `messages-${chatKey}`;
        messageContainer.classList.add('chat-messages');
        document.body.appendChild(messageContainer); // Append to the body or a specific chat container
    }

    // WebSocket event handlers
    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        const newMessage = document.createElement('p');
        newMessage.textContent = `${data.sender} : ${data.message}`;

        // Determine the role dynamically based on the sender
        if (data.sender === userName) {
            newMessage.classList.add('my-message'); // Message sent by the current user
        } else {
            newMessage.classList.add('friend-message'); // Message sent by the friend
        }

        messageContainer.appendChild(newMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom
    };

    chatSocket.onclose = function () {
        console.log(`Chat socket for ${chatKey} closed`);
        delete activeSockets[chatKey]; // Remove the WebSocket from activeSockets when closed
    };

    chatSocket.onerror = function (e) {
        console.error(`Chat socket error for ${chatKey}`, e);
    };

    // Attach event listeners for sending messages
    const senderButton = document.querySelector(`.sender`);
    const inputField = document.querySelector(`.message-input`);

    if (senderButton && inputField) {
        const sendMessage = () => {
            if (inputField.value.trim() !== '') {
                chatSocket.send(
                    JSON.stringify({
                        sender: userName, // Include the sender in the message
                        message: inputField.value,
                    })
                );
                inputField.value = ''; // Clear the input field after sending
            }
        };

        senderButton.addEventListener('click', sendMessage);

        inputField.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
                console.log('Message sent');
            }
        });
    }

    return chatSocket; // Return the new WebSocket
} */

const messageCache = {};   
const chatSockets = {}; // Track active WebSocket connections

export function Initialize(friendName, userName) {
    const chatKey = `${userName}-${friendName}`;
    const chat = document.getElementsByClassName('chat-popup')
    
    if (chatSockets[chatKey]) {
        console.log(`WebSocket for ${chatKey} already exists.`);
        return; // Prevent multiple connections for the same user-friend pair
    }

    const chatSocket2 = new WebSocket(`ws://${window.location.host}/ws/chat/${userName}/${friendName}/`);
    chatSockets[chatKey] = chatSocket2; // Store the WebSocket connection

    chatSocket2.addEventListener('message', function (e) {
        const data = JSON.parse(e.data);

        if(chat.length !== 0){
            return
        }

        if (!messageCache[friendName]) {
            messageCache[friendName] = [];
        }

        if (data.sender === friendName) {
            messageCache[friendName].push({
                sender: data.sender,
                message: data.message,
            });
        }

        updateChatIcons(friendName);
    })

    chatSocket2.onclose = function () {
        console.log(`Chat socket closed for ${chatKey}`);
        delete chatSockets[chatKey]; // Clean up the WebSocket reference
    };
}

export function setupChat(friendName, userName) {
    const chatKey = `${userName}-${friendName}`;
    const messageContainer = document.getElementById(`messages-${userName}-${friendName}`);

    if (!messageContainer) {
        console.error(`Message container for ${chatKey} not found`);
        return;
    }

    console.log(messageCache)

    let chatSocket

    // Prevent reopening WebSocket for the same user-friend pair
    if (chatSockets[chatKey]) {
        console.log(`WebSocket already active for ${chatKey}`);
        chatSocket = chatSockets[chatKey]
    }else{
        chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${userName}/${friendName}/`);
        chatSockets[chatKey] = chatSocket;
    }

    const handler =  (e) => {
        const data = JSON.parse(e.data);
        const newMessage = document.createElement('p');
        newMessage.textContent = `${data.sender} : ${data.message}`;

        if (!messageCache[friendName]) {
            messageCache[friendName] = [];
        }

        if (!messageCache[userName]) {
            messageCache[userName] = [];
        }

        // Cache messages and update UI
        if (data.sender === friendName) {
            newMessage.classList.add('friend-message');
            messageCache[friendName].push({ sender: data.sender, message: data.message });
            updateChatIcons(friendName);
        } else if (data.sender === userName) {
            newMessage.classList.add('my-message');
            messageCache[userName].push({ sender: data.sender, message: data.message, destination: friendName });
        }

        messageContainer.appendChild(newMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    chatSocket.addEventListener('message', handler)

    document.querySelector('.close-btn').addEventListener('click', () => {
        chatSocket.removeEventListener('message', handler)
    });

    const chatIcons = document.querySelectorAll('.chat-icon');
    const chatIcons2 = document.querySelectorAll('.chat-icon2');

    chatIcons.forEach((icon, index) => {
        icon.addEventListener('click', (event) => {
            chatSocket.removeEventListener('message', handler)
		});
    });

    chatIcons2.forEach((icon, index) => {
        icon.addEventListener('click', (event) => {
            chatSocket.removeEventListener('message', handler)
		});
    });

        chatSocket.onclose = function () {
            console.log(`Chat socket closed for ${chatKey}`);
            delete chatSockets[chatKey];
        };

    // Attach event listener for the "SEND" button
    const senderButton = document.querySelector(`#chat-box-${userName}-${friendName} .sender`);
    const inputField = document.querySelector(`#chat-box-${userName}-${friendName} .message-input`);

    if (senderButton && inputField) {
        senderButton.onclick = () => {
            const message = inputField.value.trim();
            if (message && chatSockets[chatKey] && chatSockets[chatKey].readyState === WebSocket.OPEN) {
                chatSockets[chatKey].send(JSON.stringify({ message })); // Send message through WebSocket
                inputField.value = ''; // Clear input field
            } else {
                console.error('WebSocket is not open or message is empty');
            }
        };

        // Add "Enter" key functionality
        inputField.onkeyup = (e) => {
            if (e.key === 'Enter') {
                senderButton.click();
            }
        };
    } else {
        console.error('Sender button or input field not found');
    }
}

export function displayMessages(friendName, userName) {
    
    console.log(messageCache)

    const messageContainer = document.getElementById(`messages-${userName}-${friendName}`);
    if (!messageContainer) return;

    // Clear the current messages
    messageContainer.innerHTML = '';

    // Display all cached messages for friend
    if (messageCache[friendName]) {
        messageCache[friendName].forEach(msg => {
            const newMessage = document.createElement('p');
            if (msg.sender === friendName) {
                newMessage.classList.add('friend-message');
                newMessage.textContent = `${msg.sender}: ${msg.message}`;
                messageContainer.appendChild(newMessage);
            }
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

     // Display all cached messages for user
     if (messageCache[userName]) {
        messageCache[userName].forEach(msg => {
            const newMessage = document.createElement('p');
            if (msg.sender === userName && msg.destination === friendName) {
                newMessage.classList.add('my-message');
                newMessage.textContent = `${msg.sender}: ${msg.message}`;
                messageContainer.appendChild(newMessage);

            }
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}

function updateChatIcons(friendName) {
    const chatIcons = document.querySelectorAll('.chat-icon');
    const chatIcons2 = document.querySelectorAll('.chat-icon2');

    chatIcons.forEach((icon, index) => {
        if (icon.getAttribute('data-friend') === friendName) {
            icon.classList.add('display-none');
            chatIcons2[index].classList.remove('display-none');
        }
    });
}