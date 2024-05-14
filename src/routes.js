import express from 'express';
import * as RoomController from './controllers/room_controller';

const router = express.Router();

// Setup routes
// create a room - admin
router.post('/rooms', async (req, res) => {
  const roomInitInfo = req.body;

  try {
    const result = await RoomController.createRoom(roomInitInfo);
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(422).json({ error: error.message });
  }
});
router.get('/rooms/:id', async (req, res) => {
  try {
    const result = await RoomController.getState(req);
    return result.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/rooms/:id', async (req, res) => {
  try {
    const result = await RoomController.joinRoom(req);
    return res.json(result);
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('not open')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/rooms/:id', async (req, res) => {
  try {
    const result = await RoomController.changeStatus(req);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.post('/rooms/:id/submissions', async (req, res) => {
  try {
    const result = await RoomController.submitAnswer(req);
    return res.json(result);
  } catch (error) {
    if (error.message === 'Not in progress') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
