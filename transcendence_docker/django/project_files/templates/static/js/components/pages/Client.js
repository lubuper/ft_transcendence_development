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

export function Initialize(friendName, userName) {
    const chatSocket2 = new WebSocket(`ws://${window.location.host}/ws/chat/${userName}/${friendName}/`);

    chatSocket2.onmessage = function (e) {
        const data = JSON.parse(e.data);

        const chat = document.getElementsByClassName('chat-popup')

        if(chat.length === 0){

            if(data.sender === friendName){
                if (!messageCache[friendName]) {
                    messageCache[friendName] = [];
                }
    
                messageCache[friendName].push({
                    sender: data.sender,
                    message: data.message
                });
            }
        }

        const chatIcons = document.querySelectorAll('.chat-icon');
        const chatIcons2 = document.querySelectorAll('.chat-icon2');

        if (data.sender === friendName) {
            // Find the correct pair of icons by matching the data attributes

            chatIcons.forEach((icon, index) => {
                if (icon.getAttribute('data-friend') === friendName) {
                    icon.classList.add('display-none');
                    chatIcons2[index].classList.remove('display-none');
                }
            });
        }
    };
}

export function setupChat(friendName, userName) { //hand
    const messageContainer = document.getElementById(`messages-${userName}-${friendName}`);

    const chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${userName}/${friendName}/`);

    if (messageCache[friendName]) {
        displayMessages(friendName, userName);
    }

    chatSocket.onmessage = function (e) {

        const chat = document.getElementsByClassName('chat-popup')

        const data = JSON.parse(e.data);
        const newMessage = document.createElement('p');
        newMessage.textContent = `${data.sender} : ${data.message}`;
        if (data.sender === userName) {
            newMessage.classList.add('my-message');

            if(chat.length !== 0){
                if (!messageCache[userName]) {
                    messageCache[userName] = [];
                }
    
                messageCache[userName].push({
                    sender: data.sender,
                    message: data.message
                });
            }
        } else if (data.sender === friendName) {
            newMessage.classList.add('friend-message');

            if(chat.length !== 0){
                if (!messageCache[friendName]) {
                    messageCache[friendName] = [];
                }
    
                messageCache[friendName].push({
                    sender: data.sender,
                    message: data.message
                });   
            }
        }
        messageContainer.appendChild(newMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    chatSocket.onclose = function () {
        console.log('Chat socket closed');
    };

    chatSocket.onerror = function (e) {
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

        inputField.addEventListener('click', function (e){

            let indexIcon = -1

            const chatIcons = document.querySelectorAll('.chat-icon');
	const chatIcons2 = document.querySelectorAll('.chat-icon2');

	chatIcons2.forEach((icon, index) => {
		if (!icon.classList.contains('display-none') && icon.getAttribute('data-friend') === friendName) {
            indexIcon = index
        }	
	});

    if(indexIcon !== -1){
        chatIcons[indexIcon].classList.remove('display-none');
				chatIcons2[indexIcon].classList.add('display-none');
    }
    })

        inputField.addEventListener('keyup', function (e) {

            if (e.key === 'Enter') {
                senderButton.click();
                console.log('Message sent');
            }
        });
    }
}

function displayMessages(friendName, userName) {
    
    console.log(messageCache)

    const messageContainer = document.getElementById(`messages-${userName}-${friendName}`);
    if (!messageContainer) return;

    // Clear the current messages
    messageContainer.innerHTML = '';

    // Display all cached messages
    if (messageCache[friendName]) {
        messageCache[friendName].forEach(msg => {
            const newMessage = document.createElement('p');
            newMessage.textContent = `${msg.sender}: ${msg.message}`;
            if (msg.sender === userName) {
                newMessage.classList.add('my-message');
            } else {
                newMessage.classList.add('friend-message');
            }
            messageContainer.appendChild(newMessage);
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}
