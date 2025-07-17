const express = require("express");
const router = express.Router();
const sql = require("../db");
const protect = require("../middleware/project");

/**
 * @swagger
 * /api/profile/submissions:
 *   get:
 *     summary: Get all submissions for the authenticated user
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   problem_id:
 *                     type: integer
 *                   problem_title:
 *                     type: string
 *                   status:
 *                     type: string
 *                   runtime_ms:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
// User all submissions
router.get("/submissions", protect, async (req, res) => {
  try {
    const userId = req.user.uid;
    const rows = await sql`
      SELECT s.id, s.problem_id, p.title as problem_title,
             s.status, s.runtime_ms, s.created_at
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `;
    res.json(rows);
  } catch (err) {
    console.error('Fetch submissions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;