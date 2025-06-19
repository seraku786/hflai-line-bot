// src/handlers/messageHandler.js
import { generateReply } from "../services/openaiService.js";
import { client } from "../lineClient.js"; // LINE SDK clientインスタンス（要用意）

// 簡単なセッション管理（メモリ内、実運用はDB推奨）
const sessions = new Map();

/**
 * LINE webhookからのメッセージイベントを処理
 * @param {object} event - LINE webhook eventオブジェクト
 */
export async function handleMessageEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const userId = event.source.userId;
  const userText = event.message.text;

  // セッションから過去の会話履歴取得、なければ初期化
  if (!sessions.has(userId)) {
    sessions.set(userId, []);
  }
  const history = sessions.get(userId);

  // Chat API用メッセージ配列作成（system + history + user message）
  const messages = [
    {
      role: "system",
      content:
        "あなたは親切で優しい相談相手です。相手の話をよく聞き、共感し、優しく返答してください。",
    },
    ...history,
    { role: "user", content: userText },
  ];

  try {
    const replyText = await generateReply(messages);

    // LINEに返信
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: replyText,
    });

    // 会話履歴にユーザー発言とAI応答を保存
    history.push({ role: "user", content: userText });
    history.push({ role: "assistant", content: replyText });

    // 履歴が多くなりすぎないように直近10ターンくらいに制限
    if (history.length > 20) {
      sessions.set(userId, history.slice(history.length - 20));
    }
  } catch (error) {
    console.error("メッセージ処理エラー:", error);
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: "申し訳ありません。現在メッセージに応答できません。",
    });
  }
}
