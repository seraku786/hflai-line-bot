// services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const personas = require('../personas');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // ←最新版推奨

async function generateReply(userMessage, persona) {
  const systemPrompt = personas[persona] || personas['フレンド'];
  const prompt = [
    {
      role: 'user',
      parts: [
        {
          text: `${systemPrompt}\n\nユーザー: ${userMessage}`
        }
      ]
    }
  ];

  try {
    const result = await model.generateContent({ contents: prompt });
    return result.response.text();
  } catch (err) {
    console.error('❌ Gemini APIエラー:', err);
    return 'ごめんなさい、AIの応答中に問題が発生しました。しばらくしてからもう一度お試しください。';
  }
}

module.exports = { generateReply };
