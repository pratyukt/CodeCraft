const express = require("express");
const router = express.Router();
const sql = require("../db");
const { hash, compare, sign } = require("../utils/authUtils");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const pwd_hash = await hash(password);
  await sql`insert into users (email, pwd_hash) values (${email}, ${pwd_hash})`;
  res.status(201).json({ ok: true });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user and get JWT token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad credentials
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = (await sql`select * from users where email=${email}`)[0] || {};
  if (!(await compare(password, user.pwd_hash)))
    return res.status(400).json({ error: "Bad creds" });
  res.json({ token: sign({ uid: user.id }) });
});

module.exports = router;