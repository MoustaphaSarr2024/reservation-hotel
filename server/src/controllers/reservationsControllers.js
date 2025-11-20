const { Op } = require('sequelize');
const Reservation = require('../models/reservationsModels');

exports.createReservation = async (req, res) => {
    try {
        const { guestName, guestEmail, roomId, dateFrom, dateTo } = req.body;

        if (!guestName || !guestEmail || !roomId || !dateFrom || !dateTo) {
            return res.status(400).json({ message: 'Champs requis manquants' });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
            return res.status(400).json({ message: 'Format d\'email invalide' });
        }

        // Validate dates
        const start = new Date(dateFrom);
        const end = new Date(dateTo);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Format de date invalide' });
        }

        if (end <= start) {
            return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
        }

        const conflictingReservation = await Reservation.findOne({
            where: {
                roomId: roomId,
                status: 'confirmed',
                [Op.and]: [
                    { dateFrom: { [Op.lt]: dateTo } },
                    { dateTo: { [Op.gt]: dateFrom } },
                ],
            },
        });

        if (conflictingReservation) {
            return res.status(400).json({ message: 'La chambre est déjà réservée pour ces dates' });
        }

        const newReservation = await Reservation.create({
            guestName,
            guestEmail,
            roomId,
            dateFrom,
            dateTo,
            status: 'confirmed',
        });

        res.status(201).json(newReservation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({ order: [['dateFrom', 'ASC']] });
        res.json(reservations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { guestName, guestEmail, roomId, dateFrom, dateTo, status } = req.body;

        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }


        if (roomId || dateFrom || dateTo) {
            const checkRoomId = roomId || reservation.roomId;
            const checkDateFrom = dateFrom || reservation.dateFrom;
            const checkDateTo = dateTo || reservation.dateTo;

            const conflictingReservation = await Reservation.findOne({
                where: {
                    roomId: checkRoomId,
                    status: 'confirmed',
                    id: { [Op.ne]: id },
                    [Op.and]: [
                        { dateFrom: { [Op.lt]: checkDateTo } },
                        { dateTo: { [Op.gt]: checkDateFrom } },
                    ],
                },
            });

            if (conflictingReservation) {
                return res.status(400).json({ message: 'La chambre est déjà réservée pour ces dates' });
            }
        }

        await reservation.update({ guestName, guestEmail, roomId, dateFrom, dateTo, status });
        res.json(reservation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }
        await reservation.destroy();
        res.json({ message: 'Réservation supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { roomId, dateFrom, dateTo } = req.query;

        if (!roomId || !dateFrom || !dateTo) {
            return res.status(400).json({ message: 'Paramètres de requête manquants' });
        }

        const conflictingReservation = await Reservation.findOne({
            where: {
                roomId: roomId,
                status: 'confirmed',
                [Op.and]: [
                    { dateFrom: { [Op.lt]: dateTo } },
                    { dateTo: { [Op.gt]: dateFrom } },
                ],
            },
        });

        if (conflictingReservation) {
            return res.json({ available: false });
        }

        res.json({ available: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

