const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerParticipant, checkRegistration } = require('../controllers/registrationController');

// Rate limiter: 200 registration requests per minute per IP to accommodate college lab/Wi-Fi IPs while preventing spam
const registrationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Too many registration attempts. Please wait a minute before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', registrationLimiter, registerParticipant);
router.get('/check', checkRegistration);

module.exports = router;
