const router = require('express').Router();
const roomsRoutes = require('./roomsRoutes');
const reservationsRoutes = require('./reservationsRoutes');

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
router.use('/rooms', roomsRoutes);
router.use('/reservations', reservationsRoutes);

module.exports = router;
