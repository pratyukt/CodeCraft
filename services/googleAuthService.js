const axios = require('axios');
const sql = require('../db');
const authUtils = require('../utils/authUtils');

// Module-level configuration
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URL;
const oauthUrl = process.env.GOOGLE_OAUTH_URL;
const tokenUrl = process.env.GOOGLE_ACCESS_TOKEN_URL;
const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

// Validate required environment variables
[
  clientId,
  clientSecret,
  redirectUri,
  oauthUrl,
  tokenUrl
].forEach((value, idx) => {
  if (!value) {
    const names = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URL',
      'GOOGLE_OAUTH_URL',
      'GOOGLE_ACCESS_TOKEN_URL'
    ];
    throw new Error(`Missing required environment variable: ${names[idx]}`);
  }
});

const GoogleAuthService = {
  /**
   * Generate Google OAuth authorization URL
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${oauthUrl}?${params.toString()}`;
  },

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Google
   * @returns {Object} Token response
   */
  async exchangeCodeForTokens(code) {
    const params = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.response?.data?.error || error.message}`);
    }
  },

  /**
   * Get user information using access token
   * @param {string} accessToken - Google access token
   * @returns {Object} User information
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.response?.data?.error || error.message}`);
    }
  },

  /**
   * Find or create user in database
   * @param {Object} googleUser - User data from Google
   * @returns {Object} User data with JWT token
   */
  async findOrCreateUser(googleUser) {
    try {
      // Check if user already exists
      const existingUser = await sql`
        SELECT * FROM users WHERE email = ${googleUser.email}
      `;

      let user;
      if (existingUser.length > 0) {
        // Update existing user
        user = await sql`
          UPDATE users 
          SET 
            name = ${googleUser.name},
            picture = ${googleUser.picture || null},
            updated_at = NOW()
          WHERE email = ${googleUser.email}
          RETURNING *
        `;
      } else {
        // Create new user
        user = await sql`
          INSERT INTO users (email, name, picture, provider, created_at, updated_at)
          VALUES (${googleUser.email}, ${googleUser.name}, ${googleUser.picture || null}, 'google', NOW(), NOW())
          RETURNING *
        `;
      }

      // Generate JWT token using authUtils
      const token = authUtils.sign({
        uid: user[0].id,
        email: user[0].email,
        name: user[0].name
      });

      return {
        user: user[0],
        token
      };
    } catch (error) {
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }
};

module.exports = GoogleAuthService;