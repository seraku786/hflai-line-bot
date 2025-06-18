// 📁 /hflai-line-bot/handlers/messageHandler.js
const line = require('@line/bot-sdk');
const { getSession } = require('../utils/sessionStore');
const { generateReply } = require('../services/geminiService');
const personas = require('../personas');

module.exports = async (req, res) => {
  const events = req.body.events;
  await Promise.all(events.map(async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') return;
    const userId = event.source.userId;
    const text = event.message.text.trim();
    const session = getSession(userId);

    const client = new line.Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
    });

    // フィードバック受付モード
    if (session.feedbackMode) {
      session.feedbackMode = false;
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'ご意見ありがとうございました！開発チームに送信されました。'
      });
    }

    // フィードバック受付開始
    if (text.includes('フィードバック') || text.includes('意見')) {
      session.feedbackMode = true;
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'こんな機能が欲しい、こんな人格があれば…など、ご自由にご意見ください！'
      });
    }

    // 人格未選択 → クイックリプライ表示
    if (!session.persona && text.toLowerCase().includes('会話を始める')) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'どの人格と話したいですか？',
        quickReply: {
          items: Object.keys(personas).map(name => ({
            type: 'action',
            action: {
              type: 'message',
              label: name,
              text: `/人格 ${name}`
            }
          }))
        }
      });
    }

    // 人格設定コマンド
    if (text.startsWith('/人格')) {
      const personaName = text.replace('/人格', '').trim();
      if (personas[personaName]) {
        session.persona = personaName;
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: `「${personaName}」人格で会話を始めます。何でも話してください。`
        });
      } else {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'その人格は存在しません。もう一度選んでください。'
        });
      }
    }

    // 会話終了 → 気分スコア確認
    if (text === '終了') {
      session.moodCheck = true;
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '会話を終えます。今の気分を1〜5で教えてください（1=落ち込み 5=スッキリ）'
      });
    }

    // 気分スコア回答 → フィードバック
    if (session.moodCheck && /^[1-5]$/.test(text)) {
      session.persona = null;
      session.moodCheck = false;
      const score = parseInt(text);
      let advice = '';
      if (score <= 2) advice = '今日はゆっくり休んで、自分を甘やかしてあげましょう。';
      else if (score === 3) advice = '少し気分が上向いてきましたね。深呼吸して余白を作りましょう。';
      else advice = 'スッキリできてよかったです！この調子で行きましょう！';
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `気分スコア ${score}/5 ですね。\n${advice}`
      });
    }

    // 通常会話 → Gemini応答
    if (session.persona) {
      const aiReply = await generateReply(text, session.persona);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: aiReply
      });
    }

    // その他未定義時
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '「会話を始める」と送って、話し相手を選んでください。フィードバックも歓迎です！'
    });
  }));
  res.status(200).end();
};
