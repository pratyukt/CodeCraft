const sql = require('../db');
const { getGeminiReply } = require('./genai');

const ChatService = {
  /**
   * Log user message to database
   * @param {number} userId - User ID
   * @param {number|null} problemId - Problem ID (optional)
   * @param {string} role - Message role (user/assistant)
   * @param {string} content - Message content
   */
  async logMessage(userId, problemId, role, content) {
    try {
      await sql`
        INSERT INTO chat_logs (user_id, problem_id, role, content_txt)
        VALUES (${userId}, ${problemId || null}, ${role}, ${content})
      `;
    } catch (error) {
      throw new Error(`Failed to log message: ${error.message}`);
    }
  },

  /**
   * Get chat history for context
   * @param {number} userId - User ID
   * @param {number|null} problemId - Problem ID (optional)
   * @param {number} limit - Number of messages to retrieve
   * @returns {Array} Chat history
   */
  async getChatHistory(userId, problemId, limit = 10) {
    try {
      const history = await sql`
        SELECT role, content_txt
        FROM chat_logs
        WHERE user_id = ${userId}
          AND (${problemId ? sql`problem_id = ${problemId}` : sql`problem_id IS NULL`})
        ORDER BY ts DESC
        LIMIT ${limit}
      `;
      return history.reverse();
    } catch (error) {
      throw new Error(`Failed to get chat history: ${error.message}`);
    }
  },

  /**
   * Process chat message and get AI response
   * @param {number} userId - User ID
   * @param {string} message - User message
   * @param {number|null} problemId - Problem ID (optional)
   * @returns {string} AI response
   */
  async processMessage(userId, message, problemId = null) {
    try {
      // Log user message
      await this.logMessage(userId, problemId, 'user', message);

      // Get chat history for context
      const history = await this.getChatHistory(userId, problemId);

      // Prepare messages for Gemini
      const chatMessages = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content_txt }]
      }));

      // Include current user message
      chatMessages.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Get AI response
      const aiReply = await getGeminiReply(chatMessages);

      // Log AI response
      await this.logMessage(userId, problemId, 'assistant', aiReply);

      return aiReply;
    } catch (error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }
};

module.exports = ChatService;