class WeeklyRotoScore {
  constructor(scores) {
    this.populateFromScores(scores);
  }

  populateFromScores(scores) {
    if (!scores) throw new Error('weekly scores required');
  }
}

module.exports = {
  WeeklyRotoScore,
};
