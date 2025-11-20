const { Op } = require('sequelize');
const Reservation = require('../models/reservationsModels');

exports.createReservation = async (req, res) => {
    try {
        const { guestName, guestEmail, roomId, dateFrom, dateTo } = req.body;

        if (!guestName || !guestEmail || !roomId || !dateFrom || !dateTo) {
            return res.status(400).json({ message: 'Missing required fields' });
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
            return res.status(400).json({ message: 'Room is already booked for these dates' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({ order: [['dateFrom', 'ASC']] });
        res.json(reservations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { guestName, guestEmail, roomId, dateFrom, dateTo, status } = req.body;

        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
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
                return res.status(400).json({ message: 'Room is already booked for these dates' });
            }
        }

        await reservation.update({ guestName, guestEmail, roomId, dateFrom, dateTo, status });
        res.json(reservation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        await reservation.destroy();
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { roomId, dateFrom, dateTo } = req.query;

        if (!roomId || !dateFrom || !dateTo) {
            return res.status(400).json({ message: 'Missing required query parameters' });
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
        res.status(500).json({ message: 'Server error' });
    }
};

