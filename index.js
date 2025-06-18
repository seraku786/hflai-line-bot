// 📁 /hflai-line-bot/index.js
require('dotenv').config();
const express = require('express');
const { middleware } = require('@line/bot-sdk');
const messageHandler = require('./handlers/messageHandler');

const app = express();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

app.post('/webhook', middleware(config), express.json(), messageHandler);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${PORT}`);
});
