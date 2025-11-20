const Room = require('../models/roomsModels');

exports.getRooms = async (_req, res) => {
  try {
    const rooms = await Room.findAll({ order: [['id', 'ASC']] });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
};