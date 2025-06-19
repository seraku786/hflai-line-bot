// 📁 index.js
const express = require('express');
const bodyParser = require('body-parser');
const { middleware } = require('@line/bot-sdk');
const messageHandler = require('./handlers/messageHandler');

const app = express();

// LINE SDKの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// ✅ 正しい順番（bodyParser → middleware）
app.use(bodyParser.json());
app.use(middleware(config));

app.post('/webhook', messageHandler);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${PORT}`);
});
