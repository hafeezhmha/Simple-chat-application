$(function () {
    const socket = io('socket.io-client');
    const $activeUsers = $('#active-users');
    const $chatMessages = $('#chat-messages');
    const $messageForm = $('#message-form');
    const $messageInput = $('#message-input');
    let username;

    // Prompt for username and emit to server
    while (!username) {
        username = prompt('Enter your username:');
    }
    socket.emit('set-username', username);

    // Function to replace specific words with emojis
    const replaceEmojis = (message) => {
        const emojiMap = {
            'React': '⚛️',
            'react': '⚛️',
            'woah': '😯',
            'hey': '👋',
            'lol': '😂',
            'like': '🖤',
            'congratulations': '🎉',
            'Woah': '😯',
            'Hey': '👋',
            'LOL': '😂',
            'Like': '🖤',
            'Congratulations': '🎉'
        };

        return message.replace(
            /React|react|woah|hey|lol|like|congratulations|Woah|Hey|LOL|Like|Congratulations/g, match => emojiMap[match]
        );
    };

    // Handle form submission
    $messageForm.submit(function (e) {
        e.preventDefault();
        const message = $messageInput.val();
        if (message.trim() !== '') {
            if (message.startsWith('/')) {
                handleCommand(message); // Handle commands
            } else {
                const messageWithEmojis = replaceEmojis(message); // Replace emojis
                socket.emit('chat-message', messageWithEmojis);
                $messageInput.val('');
            }
        }
    });

    // Update active users
    socket.on('active-users', (users) => {
        $activeUsers.empty();
        users.forEach((user) => {
            $activeUsers.append($('<div>').text(user));
        });
    });

    // Receive and display chat messages
    socket.on('chat-message', (data) => {
        const { user, msg } = data;
        const messageWithEmojis = replaceEmojis(msg); // Replace emojis
        $chatMessages.append($('<div>').text(`${user}: ${messageWithEmojis}`));
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
    });

    // Request username if not set
    socket.on('request-username', () => {
        if (!username) {
            username = prompt('Enter your username:');
            socket.emit('set-username', username);
        }
    });

    function handleCommand(command) {
        const commands = {
            '/help': 'Available commands:\n1. /random - Prints a random number.\n2. /clear - Clears all the chat.',
            '/random': 'Here\'s your random number: ' + Math.floor(Math.random() * 100),
            '/clear': clearChat,
        };

        if (commands[command]) {
            if (typeof commands[command] === 'function') {
                commands[command]();
            } else {
                displaySystemMessage(commands[command]);
            }
        } else {
            displaySystemMessage('Command not recognized. Type /help for available commands.');
        }
    }

    function clearChat() {
        $chatMessages.empty();
        displaySystemMessage('Chat cleared.');
        setTimeout(() => {
            $('.system-message').remove();
        }, 1000);
    }

    function displaySystemMessage(message) {
        const $systemMessage = $('<div>').addClass('system-message').text(message);
        $chatMessages.append($systemMessage);
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
    }
});
