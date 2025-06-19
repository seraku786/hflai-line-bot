// 📁 index.js
const express = require('express');
const { middleware } = require('@line/bot-sdk');
const messageHandler = require('./handlers/messageHandler');

const app = express();

// LINE SDKの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// ✅ middleware のみ使用、bodyParser は不要！
app.post('/webhook', middleware(config), messageHandler);

// ✅ 他のルートでは body-parser を使ってOK（今は不要）
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${PORT}`);
});
