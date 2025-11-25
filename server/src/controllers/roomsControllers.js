const Room = require('../models/roomsModels');

const { Op } = require('sequelize');
const Reservation = require('../models/reservationsModels');

exports.getRooms = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let rooms = await Room.findAll({ order: [['id', 'ASC']] });

    if (dateFrom && dateTo) {
      const busyRoomIds = await Reservation.findAll({
        attributes: ['roomId'],
        where: {
          status: 'confirmed',
          [Op.and]: [
            { dateFrom: { [Op.lt]: dateTo } },
            { dateTo: { [Op.gt]: dateFrom } },
          ],
        },
        raw: true,
      }).then(reservations => reservations.map(r => r.roomId));

      rooms = rooms.map(room => {
        const roomJson = room.toJSON();
        roomJson.isAvailable = !busyRoomIds.includes(room.id);
        return roomJson;
      });
    } else {
      rooms = rooms.map(room => {
        const roomJson = room.toJSON();
        roomJson.isAvailable = true;
        return roomJson;
      });
    }

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur base de données' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, description, capacity, price, imageUrl } = req.body;
    if (!name || !capacity || !price) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const newRoom = await Room.create({ name, description, capacity, price, imageUrl });
    res.status(201).json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, capacity, price, imageUrl } = req.body;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }
    await room.update({ name, description, capacity, price, imageUrl });
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