const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');
const sendMessageButton = document.getElementById('sendMessage');
let username;

let lastMessageTime = 0;
const RATE_LIMIT_DURATION = 4000;

function getUsername() {
    let promptedUsername = prompt("Enter a username:").trim();
    while (!promptedUsername) {
        promptedUsername = prompt("Username cannot be empty. Please enter a username:").trim();
    }
    return promptedUsername;
}

if (document.cookie.split(';').some((item) => item.trim().startsWith('username='))) {
    username = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1").trim();
    if (!username) {
        username = getUsername();
        document.cookie = "username=" + username + "; max-age=" + 365 * 24 * 60 * 60; 
    }
} else {
    username = getUsername();
    document.cookie = "username=" + username + "; max-age=" + 365 * 24 * 60 * 60; 
}

sendMessageButton.addEventListener('click', function() {
    const now = Date.now();
    
    if (now - lastMessageTime < RATE_LIMIT_DURATION) {
        alert("You're sending messages too quickly. Please wait a moment.");
        return;
    }

    const messageContent = messageInput.value;
    const imageFile = imageInput.files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function() {
            const base64Image = reader.result.split(',')[1];
            sendMessage(messageContent, base64Image);
        };
        reader.readAsDataURL(imageFile);
    } else {
        sendMessage(messageContent);
    }
});

function sendMessage(content, image) {
    const now = Date.now();
    fetch('/api/chat.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&content=${encodeURIComponent(content)}${image ? `&image=${encodeURIComponent(image)}` : ''}`
    })
    .then(() => {
        messageInput.value = '';
        imageInput.value = '';
        lastMessageTime = now;
        sendMessageButton.disabled = true;
        setTimeout(() => {
            sendMessageButton.disabled = false; 
        }, RATE_LIMIT_DURATION);
    });
}

let latestTimestamp = 0;

function fetchMessages() {
    fetch('/api/chat.js')
        .then(response => response.json())
        .then(data => {
            const newMessages = data.filter(message => message.timestamp > latestTimestamp);
            newMessages.forEach(message => {
                const messageElement = document.createElement("div");
                const usernameElement = document.createElement("span");
                usernameElement.textContent = `${message.username}: `;
                messageElement.appendChild(usernameElement);

                if (message.content) {
                    const contentElement = document.createElement("span");
                    contentElement.textContent = message.content;
                    messageElement.appendChild(contentElement);
                }

                if (message.imageURL) {
                    const imageElement = document.createElement("img");
                    imageElement.src = message.imageURL;
                    imageElement.style.width = '100px'; 
                    messageElement.appendChild(imageElement);
                }

                chatBox.appendChild(messageElement);
                if (message.timestamp > latestTimestamp) {
                    latestTimestamp = message.timestamp;
                }
            });
        });
}

function updateUserActivity() {
    fetch('/api/alive.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    })
    .then(() => {
        return fetch('/api/alive.js');
    })
    .then(response =>  response.json())
    .then(data => {
        document.getElementById('userCounter').innerText = data.count;

        const usersList = document.getElementById('activeUsersList');
        usersList.innerHTML = '';
        data.activeUsers.forEach(user => {
            const userElement = document.createElement("li");
            userElement.textContent = user;
            usersList.appendChild(userElement);
        });
    });
}

setInterval(fetchMessages, 1700);
setInterval(updateUserActivity, 9000);
