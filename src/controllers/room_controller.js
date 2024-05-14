// src/controllers/room_controller.js
import { Room, RoomStates } from '../models/room_model';
import { submit, getScores } from './submission_controller';

export async function createRoom(req, res) {
  try {
    console.log(req.body);
    const newRoom = new Room(); // Assuming your room creation request sends necessary room details in body
    newRoom.creator = req.body.creator;
    newRoom.questions = req.body.questions;
    newRoom.submissions = [];
    newRoom.status = RoomStates.CLOSED;
    newRoom.currentQuestionNumber = 0;
    newRoom.roomKey = req.body.roomKey;

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
}

export async function joinRoom(req, res) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.players.includes(req.body.name)) {
      return res.status(400).json({ message: 'Player already exists' });
    }
    room.players.push(req.body.name);
    await room.save();
    return res.json(room); // Ensure return here
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function changeStatus(req, res) {
  try {
    const room = await Room.findById(req.params.id);
    if (req.body.roomKey !== room.roomKey) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    room.status = req.body.status;
    await room.save();
    return res.json(room); // Ensure return here
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getState(req, res) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const scores = await getScores(req.params.id, room.currentQuestionNumber, room.players);
    return res.json({ ...room.toObject(), scores }); // Ensure return here
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function submitAnswer(req, res) {
  try {
    const { response } = req.body; // user's answer
    const { id, player } = req.params; // room id and player name
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    // Check answer correctness
    const isCorrect = response === room.questions[room.currentQuestionNumber].answer;
    const result = await submit(id, player, room.currentQuestionNumber, response, isCorrect);
    // Respond with the result
    return res.json(result);
  } catch (error) {
    // Handle errors
    return res.status(500).json({ error: error.message });
  }
}
