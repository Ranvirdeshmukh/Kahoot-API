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
  return submission;
}

export async function countSubmissions(roomId, questionNumber) {
  return Submission.countDocuments({ roomId, questionNumber });
}

// computes scores for all players in a room
export async function getScores(roomId, currentQuestionNumber, players) {
  const submissions = await Submission.find({ roomId });

  const scores = {};
  players.forEach((player) => {
    scores[player] = 0;
  });

  submissions.forEach((submission) => {
    // don't count unfinished rounds
    if (submission.questionNumber < currentQuestionNumber && submission.correct) {
      scores[submission.player] += 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => { return b[1] - a[1]; });

  return sorted;
}
