require('dotenv').config(); // .env fayldan o'qiydi

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

// MongoDB ulanishi
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qiyqiriq-chat';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Xabarlar uchun schema va model
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  time: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  let currentUser = '';

  socket.on('new-user', async (username) => {
    currentUser = username;

    // Oxirgi 20 ta xabarni yuborish
    const recentMessages = await Message.find().sort({ time: -1 }).limit(20).lean();
    socket.emit('chat-history', recentMessages.reverse());

    socket.broadcast.emit('user-joined', username);
  });

  socket.on('send-message', async (data) => {
    const msg = {
      username: data.username,
      message: data.message,
      time: new Date()
    };

    // Xabarni bazaga saqlash
    const newMsg = new Message(msg);
    await newMsg.save();

    // 100 tadan ortiq xabar bo'lsa, ortiqchasini o'chirish
    const count = await Message.countDocuments();
    if (count > 100) {
      const toDelete = await Message.find().sort({ time: 1 }).limit(count - 100);
      const ids = toDelete.map(doc => doc._id);
      await Message.deleteMany({ _id: { $in: ids } });
    }

    socket.broadcast.emit('receive-message', msg);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});