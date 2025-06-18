// 📁 /hflai-line-bot/utils/sessionStore.js
const sessionStore = {}; // メモリ上の簡易ユーザーセッション
function getSession(userId) {
  if (!sessionStore[userId]) {
    sessionStore[userId] = {
      persona: null,
      moodCheck: false,
      feedbackMode: false,
    };
  }
  return sessionStore[userId];
}
module.exports = { getSession };