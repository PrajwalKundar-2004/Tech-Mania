const express = require('express');
const router = express.Router();
const { getEvents, getEventById, updateEvent } = require('../controllers/eventController');
const { protectAdmin } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', protectAdmin, updateEvent);

module.exports = router;
