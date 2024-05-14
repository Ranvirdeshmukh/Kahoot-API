import { Room, RoomStates } from '../models/room_model';
import { submit, getScores, countSubmissions } from './submission_controller';
import Submission from '../models/submission_model';

export async function createRoom(req, res) {
  try {
    const newRoom = new Room({
      creator: req.body.creator,
      questions: req.body.questions,
      submissions: [],
      status: RoomStates.CLOSED,
      currentQuestionNumber: 0,
      roomKey: req.body.roomKey,
    });

    await newRoom.save();
    res.status(200).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(422).json({ error: error.message });
  }
}

export async function joinRoom(req, res) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
    } else if (room.status !== RoomStates.OPEN) {
      res.status(422).json({ message: 'Room is not open for joining' });
    } else if (room.players.includes(req.body.name)) {
      res.status(400).json({ message: 'Player already exists' });
    } else {
      room.players.push(req.body.name);
      await room.save();
      res.json(room);
    }
  } catch (error) {
    console.error(error);
    res.status(422).json({ error: error.message });
  }
}

export async function changeStatus(req, res) {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
    }
    if (req.body.roomKey !== room.roomKey) {
      res.status(403).json({ message: 'Unauthorized' });
    }
    room.status = req.body.status;
    await room.save();
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(422).json({ error: error.message });
  }
}

// returns the main game state with current question, rank, game status, and scoreboard
// returns the main game state with current question, rank, game status, and scoreboard
export async function getState(req, res) {
  const roomId = req.params.id;
  const { player } = req.query;
  const room = await Room.findById(roomId);
  const scores = await getScores(roomId, room.currentQuestionNumber, room.players);
  const topThree = scores.slice(0, 3);

  // get rank of requestingPlayer
  const requestingPlayerScoreboardPosition = scores.findIndex((entry) => { return entry[0] === player; });

  const gameOver = room.currentQuestionNumber === room.questions.length;

  const state = {
    roomId,
    status: room.status,
    players: room.players,
    yourName: player,
    yourRank: requestingPlayerScoreboardPosition === -1 ? null : requestingPlayerScoreboardPosition + 1,
    top3: topThree,
    currentQuestionNumber: gameOver ? -1 : room.currentQuestionNumber,
    currentQuestion: gameOver ? -1 : room.questions[room.currentQuestionNumber].prompt,
  };

  res.json(state);
}

export async function submitAnswer(req, res) {
  try {
    const { response, player } = req.body;
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
    } else if (!room.players.includes(player)) {
      res.status(400).json({ message: 'Player not found in the room' });
    } else if (await hasSubmitted(id, player, room.currentQuestionNumber)) {
      res.status(422).json({ message: 'Answer already submitted' });
    } else {
    // Check answer correctness
      const isCorrect = response === room.questions[room.currentQuestionNumber].answer;
      const result = await submit(id, player, room.currentQuestionNumber, response, isCorrect);

      // Count the number of submissions for the current question
      const numSubmissions = await countSubmissions(id, room.currentQuestionNumber);

      // If all players have submitted, move to the next question
      if (numSubmissions === room.players.length) {
        room.currentQuestionNumber += 1;

        // If all questions are answered, set game state to GAME_OVER
        if (room.currentQuestionNumber === room.questions.length) {
          room.status = RoomStates.GAME_OVER;
        }

        await room.save();
      }

      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(422).json({ error: error.message });
  }
}

export async function hasSubmitted(roomId, player, questionNumber) {
  return Submission.exists({ roomId, player, questionNumber });
}

export async function forceNextQuestion(req, res) {
  try {
    const { id } = req.params;
    const { roomKey } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
    }
    if (roomKey !== room.roomKey) {
      res.status(403).json({ message: 'Unauthorized' });
    }

    // Move to the next question
    room.currentQuestionNumber += 1;

    // If all questions are answered, set game state to GAME_OVER
    if (room.currentQuestionNumber === room.questions.length) {
      room.status = RoomStates.GAME_OVER;
    }

    await room.save();
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(422).json({ error: error.message });
  }
}
