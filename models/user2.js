import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('User 2 connected');
});

socket.on('newMessage', (message) => {
    console.log(`Received message from User 1: ${message.content}`);
});

socket.on('messageSent', (message) => {
    console.log(`Sent message to User 1: ${message.content}`);
});

setTimeout(() => {
    socket.emit('sendMessage', {
        senderId: '66337d122bc8d70eb95d6568',
        receiverId: '66338550197b914254d91557',
        content: 'Hi, User 1!'
    });
}, 4000);
