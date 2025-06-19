import express from "express";
import dotenv from "dotenv";
import line from "@line/bot-sdk";
+ import { handleMessageEvent } from "./handlers/messageHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// LINE SDKの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// グローバルに使いたい場合はmessageHandler.jsへclientを渡すなど検討してください
// ここではグローバルにセット
export { client };

// ミドルウェア設定
app.post(
  "/webhook",
  line.middleware(config),
  async (req, res) => {
    try {
      const events = req.body.events;

      // 複数イベントをPromise.allで並列処理
      await Promise.all(
        events.map(async (event) => {
          if (event.type === "message") {
            await handleMessageEvent(event);
          }
          // 他のイベントタイプ（フォロー、アンフォローなど）は必要に応じて処理を追加
        })
      );

      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhookエラー:", error);
      res.status(500).send("Error");
    }
  }
);

app.listen(port, () => {
  console.log(`🚀 HFLAI LINE Bot is running on port ${port}`);
});
