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
        const timestamp = Date.now();

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
                timestamp
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
        const timestamp = Date.now();
        const formattedTime = formatTimestamp(timestamp); // Get the current timestamp
        const statusDot = document.getElementById(`friend-status-${friendName}`).getAttribute('data-status');

        newMessage.textContent = `${data.sender} ${formattedTime}: ${data.message}`;

        if (!messageCache[friendName]) {
            messageCache[friendName] = [];
        }

        if (!messageCache[userName]) {
            messageCache[userName] = [];
        }

        // Cache messages and update UI
        if (data.sender === friendName) {
            newMessage.classList.add('friend-message');
            messageCache[friendName].push({ sender: data.sender, message: data.message, timestamp });
            updateChatIcons(friendName);
        } else if (data.sender === userName) {
            newMessage.classList.add('my-message');
            if(statusDot === 'online'){
                messageCache[userName].push({ sender: data.sender, message: data.message, timestamp, destination: friendName });
            }else{
                newMessage.textContent = `-- Message was not sent. ${friendName} is offline --`;
            }
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

         // Add event listener to clear notifications on focus
         inputField.addEventListener('focus', () => {
            const chatIcon = document.querySelector(`.chat-icon[data-friend="${friendName}"]`);
            const chatIcon2 = document.querySelector(`.chat-icon2[data-friend="${friendName}"]`);

            if (chatIcon) {
                chatIcon.classList.remove('display-none');
            }
            if (chatIcon2) {
                chatIcon2.classList.add('display-none');
            }
        });

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
    const messageContainer = document.getElementById(`messages-${userName}-${friendName}`);
    if (!messageContainer) return;

    // Clear the current messages
    messageContainer.innerHTML = '';

    // Combine and sort messages by timestamp
    const combinedMessages = [
        ...(messageCache[friendName] || []),
        ...(messageCache[userName]?.filter(msg => msg.destination === friendName) || [])
    ].sort((a, b) => a.timestamp - b.timestamp);

    // Display the sorted messages with timestamps
    combinedMessages.forEach(msg => {
        const newMessage = document.createElement('p');
        const formattedTime = formatTimestamp(msg.timestamp); // Format the timestamp

        if (msg.sender === friendName) {
            newMessage.classList.add('friend-message');
        } else if (msg.sender === userName) {
            newMessage.classList.add('my-message');
        }

        newMessage.textContent = `${msg.sender} ${formattedTime}: ${msg.message}`; // Include timestamp
        messageContainer.appendChild(newMessage);
    });

    messageContainer.scrollTop = messageContainer.scrollHeight;
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

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}