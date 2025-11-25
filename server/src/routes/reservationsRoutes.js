const router = require('express').Router();
const reservationsController = require('../controllers/reservationsControllers');

router.post('/', reservationsController.createReservation);
router.get('/', reservationsController.getReservations);
router.get('/availability', reservationsController.checkAvailability);
router.get('/:id', reservationsController.getReservationById);
router.put('/:id', reservationsController.updateReservation);
router.delete('/:id', reservationsController.deleteReservation);

module.exports = router;
