$(function () {
    const socket = io();
    const $activeUsers = $('#active-users');
    const $chatMessages = $('#chat-messages');
    const $messageForm = $('#message-form');
    const $messageInput = $('#message-input');
    const $onlineUsersCount = $('#online-users-count'); // Element to display online users count
    let username;
    let onlineUsersCount = 0;

    // Prompt for username and emit to server
    while (!username) {
        username = prompt('Enter your username:');
    }
    socket.emit('set-username', username);

    // Emoji map
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
        'Congratulations': '🎉',
        'Reacting': 'Reacting',
        'reacting' : 'reacting'
    };

    // Function to replace specific words with emojis
    const replaceEmojis = (message) => {
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
                $messageInput.val(''); // Clear the input field after sending a command
            } else {
                const messageWithEmojis = replaceEmojis(message); // Replace emojis
                socket.emit('chat-message', messageWithEmojis);
                $messageInput.val('');
            }
        }
    });

    // Update active users
    socket.on('active-users', (users) => {
        onlineUsersCount = users.length;
        updateOnlineUsersCount(); // Update count
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

    function clearChat() {
        $chatMessages.empty();
        displaySystemMessage('Chat cleared.');
        setTimeout(() => {
            $('.system-message').remove();
        }, 2000);
    }

    function handleCommand(command) {
        const args = command.split(' ');
        switch (args[0]) {
            case '/help':
                displaySystemMessage('Available commands:\n1. /random - Prints a random number.\n2. /clear - Clears all the chat.\n3. /rem <name> <value> - Set or recall a value.\n4. /calc <expression> - Perform a calculation.');
                break;
            case '/random':
                displaySystemMessage(`Here's your random number: ${Math.floor(Math.random() * 100)}`);
                break;
            case '/clear':
                clearChat();
                break;
            case '/rem':
                handleRemCommand(args);
                break;
            case '/calc':
                handleCalcCommand(args);
                break;
            default:
                displaySystemMessage('Command not recognized. Type /help for available commands.');
        }
    }

    function handleRemCommand(args) {
        const name = args[1];
        const value = args.slice(2).join(' ');
        if (value) {
            displaySystemMessage(`Value set for ${name}: ${value}`);
        } else {
            displaySystemMessage(`Value for ${name}: ${value}`);
        }
    }

    function handleCalcCommand(args) {
        try {
            const expression = args.slice(1).join(' ');
            const result = eval(expression);
            displaySystemMessage(`Result: ${result}`);
        } catch (error) {
            displaySystemMessage('Invalid expression');
        }
    }

    function updateOnlineUsersCount() {
        const countText = onlineUsersCount === 1 ? '1 user online' : `${onlineUsersCount} users online`;
        $onlineUsersCount.text(countText);
    }

    function displaySystemMessage(message) {
        const $systemMessage = $('<div>').addClass('system-message').text(message);
        $chatMessages.append($systemMessage);
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
    }
});

