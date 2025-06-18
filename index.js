// 📁 index.js
const express = require('express');
const line = require('@line/bot-sdk');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const messageHandler = require('./handlers/messageHandler');

// .envファイルがある場合は読み込む（ローカル開発用）
dotenv.config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

// LINE SDKのミドルウェア設定
app.post('/webhook', line.middleware(config), bodyParser.json(), messageHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${PORT}`);
});
