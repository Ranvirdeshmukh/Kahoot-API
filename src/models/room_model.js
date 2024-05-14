import mongoose from 'mongoose';

export const RoomStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  GAME_OVER: 'GAME_OVER',
  OPEN: 'OPEN',
};

const RoomSchema = new mongoose.Schema({
  creator: { type: String, required: true },
  questions: [{ prompt: String, answer: String }],
  players: [{ type: String }],
  roomKey: { type: String, required: true },
  status: { type: String, enum: Object.values(RoomStates), default: RoomStates.CLOSED },
  currentQuestionNumber: { type: Number, default: 0 },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

export const Room = mongoose.model('Room', RoomSchema);
