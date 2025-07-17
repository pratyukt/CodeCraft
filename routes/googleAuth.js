const express = require('express');
const router = express.Router();
const googleAuthService = require('../services/googleAuthService');

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirect to Google OAuth
 *     tags:
 *       - Authentication
 *     description: Redirects user to Google's OAuth 2.0 authorization server
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/google', (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthorizationUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth redirect error:', error);
    res.status(500).json({ error: 'Failed to initiate Google OAuth' });
  }
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags:
 *       - Authentication
 *     description: Handles the callback from Google OAuth and exchanges code for tokens
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: Missing authorization code
 *       500:
 *         description: Authentication failed
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ 
      success: false,
      error: 'Authorization code is required' 
    });
  }

  try {
    // Exchange code for tokens
    const tokens = await googleAuthService.exchangeCodeForTokens(code);
    
    // Get user information
    const googleUser = await googleAuthService.getUserInfo(tokens.access_token);
    
    // Find or create user in database
    const { user, token } = await googleAuthService.findOrCreateUser(googleUser);
    
    // In production, you might want to redirect to frontend with token
    // For now, return JSON response
    res.json({
      success: true,
      message: `Welcome, ${user.name}!`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      token
    });
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;