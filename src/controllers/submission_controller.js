// src/controllers/submission_controller.js
import Submission from '../models/submission_model';

export async function submit(roomId, player, questionNumber, response, correct) {
  const submission = new Submission({
    roomId,
    player,
    questionNumber,
    response,
    correct,
  });
  await submission.save();
  return submission; // Directly return the promise, not using `return await`
}

export async function countSubmissions(roomId, questionNumber) {
  return Submission.countDocuments({ roomId, questionNumber }); // Remove `await` when returning
}

export async function getScores(roomId, currentQuestionNumber, players) {
  const submissions = await Submission.find({ roomId });
  const scores = {};
  players.forEach((player) => {
    // Calculating scores based on submissions
    scores[player] = submissions.filter((sub) => { return sub.player === player && sub.correct; }).length;
  });
  return scores; // Return scores directly since no promises are involved in this return
}
