import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('User 1 connected');
});

socket.on('newMessage', (message) => {
    console.log(`Received message from User 2: ${message.content}`);
});

socket.on('messageSent', (message) => {
    console.log(`Sent message to User 2: ${message.content}`);
});

setTimeout(() => {
    socket.emit('sendMessage', {
        senderId: '66338550197b914254d91557',
        receiverId: '66337d122bc8d70eb95d6568',
        content: 'Hello, User 2!'
    });
}, 2000);
