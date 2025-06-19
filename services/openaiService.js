// src/services/openaiService.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT-3.5へ会話履歴を渡して応答を生成する
 * @param {Array} messages - OpenAI Chat API形式のメッセージ配列
 * @returns {string} GPTの応答テキスト
 */
export async function generateReply(messages) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    // 応答テキストを返す
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI APIエラー:", error);
    throw error;
  }
}
