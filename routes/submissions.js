const express = require("express");
const router = express.Router();
const sql = require("../db");
const protect = require("../middleware/project");
const { postToJudge0, getFromJudge0 } = require("../utils/judge0");

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_KEY = process.env.JUDGE0_KEY;

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit code for a problem
 *     tags:
 *       - Submissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               problem_id:
 *                 type: integer
 *                 description: The problem ID
 *               code_txt:
 *                 type: string
 *                 description: The source code to submit
 *     responses:
 *       201:
 *         description: Submission result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submission_id:
 *                   type: integer
 *                 verdict:
 *                   type: string
 *                 runtime_ms:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 failedCase:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: string
 *                     expected:
 *                       type: string
 *                     actual:
 *                       type: string
 *                     status:
 *                       type: string
 *                     stderr:
 *                       type: string
 *       404:
 *         description: No test cases found for this problem
 *       500:
 *         description: Internal server error
 */
// Submissions
router.post("/", protect, async (req, res) => {
  try {
    const { problem_id, code_txt } = req.body;
    const user_id = req.user.uid;

    const testCases = await sql`
      SELECT input_txt, expected_txt, is_hidden
      FROM test_cases
      WHERE problem_id = ${problem_id}
      ORDER BY id;
    `;

    if (!testCases.length) {
      return res
        .status(404)
        .json({ error: "No test cases found for this problem." });
    }

    const languageId = 62; // Java
    const submissions = testCases.map((tc) => ({
      language_id: languageId,
      source_code: code_txt,
      stdin: tc.input_txt,
      expected_output: tc.expected_txt,
    }));

    const judge0TokenRes = await postToJudge0(
      `${JUDGE0_URL}/submissions/batch?base64_encoded=false`,
      { submissions },
      {
        "X-RapidAPI-Key": JUDGE0_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      }
    );

    const tokens = judge0TokenRes.map((s) => s.token).join(",");
    const resultsRes = await getFromJudge0(
      `${JUDGE0_URL}/submissions/batch?tokens=${tokens}&base64_encoded=false`,
      {
        "X-RapidAPI-Key": JUDGE0_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      }
    );

    const results = resultsRes.submissions;

    let isAccepted = true;
    let failedCase = null;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status.id !== 3) {
        isAccepted = false;
        failedCase = {
          input: testCases[i].input_txt,
          expected: testCases[i].expected_txt,
          actual: r.stdout || "",
          status: r.status.description,
          stderr: r.stderr || "",
        };
        break;
      }
    }

    const runtime = Math.max(
      ...results.map((r) => Math.floor((parseFloat(r.time) || 0) * 1000))
    );

    const finalStatus = isAccepted ? "AC" : "WA";

    const [inserted] = await sql`
      INSERT INTO submissions (user_id, problem_id, code_txt, status, runtime_ms)
      VALUES (${user_id}, ${problem_id}, ${code_txt}, ${finalStatus}, ${runtime})
      RETURNING id;
    `;

    return res.status(201).json({
      submission_id: inserted.id,
      verdict: finalStatus,
      runtime_ms: runtime,
      ...(isAccepted
        ? { message: "Accepted ✅" }
        : { message: "Wrong Answer ❌", failedCase }),
    });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;