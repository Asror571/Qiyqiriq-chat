const socket = io();
let username = '';

// Elementlar
const usernameOverlay = document.getElementById('username-overlay');
const usernameInput = document.getElementById('usernameInput');
const enterChat = document.getElementById('enterChat');
const chatBox = document.getElementById('chat-box');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Username kiritish
enterChat.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    usernameOverlay.style.display = 'none';
    socket.emit('new-user', username);
  }
});

// Xabar yuborish
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg) {
    appendOwnMessage(msg);
    socket.emit('send-message', { username, message: msg });
    messageInput.value = '';
  }
});

// Foydalanuvchi qo‘shildi
socket.on('user-joined', (name) => {
  appendInfo(`${name} chatga qo‘shildi`);
});

// Xabar olish
socket.on('receive-message', (data) => {
  if (data.username !== username) {
    appendMessage(data.username, data.message);
  }
});

// Eski xabarlar (20 ta)
socket.on('chat-history', (messages) => {
  messages.forEach((msg) => {
    if (msg.username === username) {
      appendOwnMessage(msg.message);
    } else {
      appendMessage(msg.username, msg.message);
    }
  });
});

// Funksiya: oddiy xabar
function appendMessage(name, msg) {
  const div = document.createElement('div');
  div.classList.add('msg');
  div.textContent = `${name}: ${msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Funksiya: o‘zingiz yuborgan xabar
function appendOwnMessage(msg) {
  const div = document.createElement('div');
  div.classList.add('own-msg');
  div.textContent = `Siz: ${msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Funksiya: info xabar (foydalanuvchi qo‘shildi)
function appendInfo(msg) {
  const div = document.createElement('div');
  div.classList.add('info');
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
