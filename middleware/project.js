const { verify } = require('../utils/authUtils');

function protect(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') && hdr.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = verify(token); next(); }
  catch { return res.status(401).json({ error: 'Bad token' }); }
}

module.exports = protect;