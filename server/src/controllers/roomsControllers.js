const Room = require('../models/roomsModels');

exports.getRooms = async (_req, res) => {
  try {
    const rooms = await Room.findAll({ order: [['id', 'ASC']] });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur base de données' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, description, capacity, price } = req.body;
    if (!name || !capacity || !price) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const newRoom = await Room.create({ name, description, capacity, price });
    res.status(201).json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, capacity, price } = req.body;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }
    await room.update({ name, description, capacity, price });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }
    await room.destroy();
    res.json({ message: 'Chambre supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};