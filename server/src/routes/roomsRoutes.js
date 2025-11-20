const router = require('express').Router();
const Room = require('../models/roomsModels');

// GET /api/rooms
router.get('/', async (_req, res) => {
  try {
    const rooms = await Room.findAll({ order: [['id', 'ASC']] });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
});

module.exports = router;