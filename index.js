// 📁 /hflai-line-bot/index.js
const express = require('express');
const line = require('@line/bot-sdk');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const messageHandler = require('./handlers/messageHandler');

// 環境変数読み込み
dotenv.config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();
app.use(bodyParser.json());
app.post('/webhook', line.middleware(config), messageHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${PORT}`);
});