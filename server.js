const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const path = require('path');
const PORT = process.env.PORT || 3000;

// Static fayllarni serve qilish (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// 20 ta so‘nggi xabarni saqlash uchun
let messages = [];

io.on('connection', (socket) => {
  let currentUser = '';

  // Yangi foydalanuvchi qo‘shildi
  socket.on('new-user', (username) => {
    currentUser = username;

    // Faqat oxirgi 20 xabarni yuborish
    socket.emit('chat-history', messages.slice(-20));

    // Boshqalarga bu user qo‘shilganini bildirish
    socket.broadcast.emit('user-joined', username);
  });

  // Foydalanuvchi xabar yubordi
  socket.on('send-message', (data) => {
    const msg = {
      username: data.username,
      message: data.message,
      time: new Date().toISOString(),
    };

    // Xabarni saqlash
    messages.push(msg);
    if (messages.length > 100) messages.shift(); // eng eski xabarni o‘chirish

    // Barcha clientlarga yuborish
    socket.broadcast.emit('receive-message', msg);
  });

  // Agar user disconnect bo‘lsa — bu qism hozircha shart emas, lekin kerak bo‘lishi mumkin
  // socket.on('disconnect', () => {
  //   if (currentUser) {
  //     io.emit('user-left', currentUser);
  //   }
  // });
});

// Serverni ishga tushirish
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
