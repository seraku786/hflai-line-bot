// 📁 /hflai-line-bot/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const personas = require('../personas');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateReply(userMessage, persona) {
  const prompt = [
    { role: 'system', content: personas[persona] || personas['フレンド'] },
    { role: 'user', content: userMessage },
  ];
  try {
    const result = await model.generateContent({ contents: prompt });
    return result.response.text();
  } catch (err) {
    console.error('Gemini API error:', err);
    return 'ごめんなさい、少し時間をおいてもう一度話しかけてくれる？';
  }
}
module.exports = { generateReply };
