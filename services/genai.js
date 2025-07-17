const { GoogleGenerativeAI } = require("@google/generative-ai");

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function normalizeRole(role) {
  // Accept only 'user' and 'model'
  if (role === "assistant") return "model";
  if (role === "user") return "user";
  return "user";
}

async function getGeminiReply(chatMessages) {
  const model = gemini.getGenerativeModel({ model: "gemini-2.5-pro" });
  const formattedMessages = chatMessages.map(msg => ({
    role: normalizeRole(msg.role),
    parts: msg.parts,
  }));

  const result = await model.generateContent({
    contents: formattedMessages
  });

  return (
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I'm not sure how to respond."
  );
}

module.exports = { getGeminiReply };