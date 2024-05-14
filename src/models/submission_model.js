import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  player: { type: String, required: true },
  response: { type: String, required: true },
  questionNumber: { type: Number, required: true },
  correct: { type: Boolean, required: true },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;
