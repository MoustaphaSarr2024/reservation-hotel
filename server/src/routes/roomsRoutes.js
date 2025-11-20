const router = require('express').Router();
const roomsController = require('../controllers/roomsControllers');

// GET /api/rooms
router.get('/', roomsController.getRooms);
router.post('/', roomsController.createRoom);
router.put('/:id', roomsController.updateRoom);
router.delete('/:id', roomsController.deleteRoom);

module.exports = router;