const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));


let messages = [];

io.on('connection', (socket) => {
  let currentUser = '';

  socket.on('new-user', (username) => {
    currentUser = username;

   
    socket.emit('chat-history', messages.slice(-20));

 
    socket.broadcast.emit('user-joined', username);
  });

 
  socket.on('send-message', (data) => {
    const msg = {
      username: data.username,
      message: data.message,
      time: new Date().toISOString(),
    };

   
    messages.push(msg);
    if (messages.length > 100) messages.shift(); 

    socket.broadcast.emit('receive-message', msg);
  });


});

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
