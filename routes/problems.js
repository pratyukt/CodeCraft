const express = require("express");
const router = express.Router();
const sql = require("../db");

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: Get all problems
 *     tags:
 *       - Problems
 *     responses:
 *       200:
 *         description: List of problems
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   difficulty:
 *                     type: string
 */
router.get("/", async (_, res) => {
  const rows = await sql`select id, title, slug, difficulty from problems`;
  res.json(rows);
});

module.exports = router;