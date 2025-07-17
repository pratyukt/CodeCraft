const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const protect = require('../middleware/project');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a chat message and get AI response
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message
 *               problem_id:
 *                 type: integer
 *                 description: The problem ID (optional)
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: AI reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reply:
 *                   type: string
 *                   description: The AI's reply
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', protect, async (req, res) => {
    try {
        const { message, problem_id } = req.body;
        const userId = req.user.uid;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and cannot be empty.'
            });
        }

        const aiReply = await chatService.processMessage(userId, message, problem_id);

        res.json({
            success: true,
            reply: aiReply
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message',
            details: error.message
        });
    }
});

module.exports = router;