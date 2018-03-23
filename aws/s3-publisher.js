const _ = require('privatize')();
const S3 = require('aws-sdk/clients/s3');
const VError = require('verror');

class S3Publisher {
  constructor(s3 = new S3({ apiVersion: '2006-03-01' })) {
    _(this).s3 = s3;
    _(this).s3Prefix = process.env.FE_CHEESE_PUB_PREFIX || '';
    _(this).targetBucket = process.env.FE_CHEESE_PUB_BUCKET;

    if (!_(this).targetBucket) {
      throw new Error('FE_CHEESE_PUB_BUCKET value missing');
    }
  }

  async write(scores, team) {
    let result = {};

    try {
      if (!scores) throw new Error('scores are required to publish');
      if (!scores.weekNumber) throw new Error('scores must contain a week');

      const s3Prefix = _(this).s3Prefix ? `${_(this).s3Prefix}/` : '';

      result.scorePubResult = await _(this).s3.putObject({
        Body: JSON.stringify(scores),
        Bucket: _(this).targetBucket,
        Key: `${s3Prefix}scores-week-${scores.weekNumber}.json`,
      }).promise();

      if (team) {
        result.teamPubResult = await _(this).s3.putObject({
          Body: JSON.stringify(team),
          Bucket: _(this).targetBucket,
          Key: `${s3Prefix}teams.json`
        }).promise();
      }
    }
    catch(writeError) { throw new VError(writeError, 'failed to write to S3'); }

    return result;
  }
}

module.exports = {
  S3Publisher,
}
