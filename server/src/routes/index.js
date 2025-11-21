const router = require('express').Router();
const roomsRoutes = require('./roomsRoutes');
const reservationsRoutes = require('./reservationsRoutes');
const authRoutes = require('./authRoutes');

router.get('/health', (req, res) => {
    res.json({ message: 'Serveur en ligne', status: 'ok' });
});
router.use('/rooms', roomsRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/auth', authRoutes);

module.exports = router;
