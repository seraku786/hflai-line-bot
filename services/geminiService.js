// 📁 services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const personas = require('../personas');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    console.error('❌ Gemini API error:', err);
    return 'ごめんなさい、AIの応答中に問題が発生しました。少し時間を置いて再試行してください。';
  }
}

module.exports = { generateReply };
