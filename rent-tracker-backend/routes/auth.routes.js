const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/register', register);

module.exports = router;

// Add this temporary debug route to auth.routes.js
router.get('/debug-token', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      tokenExists: true,
      decodedPayload: decoded,
      hasUserId: !!decoded.userId,
      hasId: !!decoded.id,
      has_id: !!decoded._id,
      allFields: Object.keys(decoded)
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});