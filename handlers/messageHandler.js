const line = require('@line/bot-sdk');
const { getSession } = require('../utils/sessionStore');
const { generateReply } = require('../services/geminiService');
const personas = require('../personas');

module.exports = async (req, res) => {
  console.log('Webhook events:', JSON.stringify(req.body.events, null, 2));

  const events = req.body.events;

  await Promise.all(events.map(async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') return;

    const userId = event.source.userId;
    const text = event.message.text.trim();
    const session = getSession(userId);

    const client = new line.Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
    });

    try {
      // フィードバック受付モード
      if (session.feedbackMode) {
        session.feedbackMode = false;
        return await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'ご意見ありがとうございました！開発チームに送信されました。'
        });
      }

      // フィードバック受付開始
      if (text.includes('フィードバック') || text.includes('意見')) {
        session.feedbackMode = true;
        return await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'こんな機能が欲しい、こんな人格があれば…など、ご自由にご意見ください！'
        });
      }

      // 人格未選択 → クイックリプライ表示
      if (!session.persona && text.toLowerCase().includes('会話を始める')) {
        return await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'どの人格と話したいですか？',
          quickReply: {
            items: Object.keys(personas).map(name => ({
              type: 'action',
              action: {
                type: 'message',
                label: name.slice(0, 12), // 12文字制限（LINE推奨）
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
          return await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `「${personaName}」人格で会話を始めます。何でも話してください。`
          });
        } else {
          return await client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'その人格は存在しません。もう一度選んでください。'
          });
        }
      }

      // 会話終了 → 気分スコア確認
      if (text === '終了') {
        session.moodCheck = true;
        return await client.replyMessage(event.replyToken, {
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

        return await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `気分スコア ${score}/5 ですね。\n${advice}`
        });
      }

      // 通常会話 → Gemini応答
      if (session.persona) {
        const aiReply = await generateReply(text, session.persona);
        console.log('AI Reply:', aiReply);

        if (!aiReply || typeof aiReply !== 'string' || aiReply.trim() === '') {
          // 応答が空の場合の代替メッセージ
          return await client.replyMessage(event.replyToken, {
            type: 'text',
            text: '申し訳ありません。応答を生成できませんでした。もう一度試してください。'
          });
        }

        return await client.replyMessage(event.replyToken, {
          type: 'text',
          text: aiReply
        });
      }

      // その他未定義時
      return await client.replyMessage(event.replyToken, {
        type: 'text',
        text: '「会話を始める」と送って、話し相手を選んでください。フィードバックも歓迎です！'
      });

    } catch (error) {
      console.error('LINE API replyMessage エラー:', error);
      // エラー時の返信（任意）
      try {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'エラーが発生しました。しばらくしてからまたお試しください。'
        });
      } catch (e) {
        console.error('エラー返信に失敗しました:', e);
      }
    }
  }));

  res.status(200).end();
};
