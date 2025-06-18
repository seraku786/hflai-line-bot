// 📁 index.js
const express = require('express');
const bodyParser = require('body-parser');
const { middleware } = require('@line/bot-sdk');
require('dotenv').config();

const app = express();

// LINE SDKの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// LINEのミドルウェアとエンドポイント
app.use(middleware(config));
app.use(bodyParser.json());

const messageHandler = require('./handlers/messageHandler');
app.post('/webhook', messageHandler);

// Render用のポート設定
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${PORT}`);
});
