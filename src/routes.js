import express from 'express';
import * as RoomController from './controllers/room_controller';

const router = express.Router();

// create a room - admin
router.post('/rooms', RoomController.createRoom);

// get room state
router.get('/rooms/:id', RoomController.getState);

// join a room
router.post('/rooms/:id', RoomController.joinRoom);

// change room status - admin
router.patch('/rooms/:id', RoomController.changeStatus);

// submit a response
router.post('/rooms/:id/submissions', RoomController.submitAnswer);

// force move to next question
router.post('/rooms/:id/force-next', RoomController.forceNextQuestion);

export default router;
