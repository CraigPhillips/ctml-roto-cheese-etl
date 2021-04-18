import privacy from 'private-parts';

let _;
export default class ResultsPublisher {
  constructor(s3Bucket, s3Path, s3, log) {
    if (!_) _ = privacy.createKey();
    Object.assign(_(this), {
      log,
      s3,
      s3Bucket,
      s3Path: s3Path.endsWith('/') ? s3Path : `${s3Path}/`,
    });
  }

  async publishTeamData(teams) {
    const Bucket = _(this).s3Bucket;
    const Key = `${_(this).s3Path}teams.json`;
    const s3Input = { Body: JSON.stringify(teams), Bucket, Key };
    _(this).log.debug('writing teams to S3', { Bucket, Key });
    await _(this).s3.putObject(s3Input).promise();
  }

  async publishWeeklyRotoData(weeklyScores) {
    const Bucket = _(this).s3Bucket;
    const Key = `${_(this).s3Path}scores-week-${weeklyScores.weekNumber}.json`;
    const s3Input = { Body: JSON.stringify(weeklyScores), Bucket, Key };
    _(this).log.debug('writing scores to S3', { Bucket, Key });
    await _(this).s3.putObject(s3Input).promise();
  }
}
