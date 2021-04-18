import beThere from 'be-there';
import privacy from 'private-parts';

const Namespace = 'CtmlRotoCheese';

let _;
export default class Metrics {
  constructor(cloudWatch) {
    if (!_) _ = privacy.createKey();

    Object.assign(_(this), {
      cloudWatch,
    });
    beThere(_(this));
  }

  async recordMatchupDomType(matchupDomType) {
    return _(this).cloudWatch.putMetricData({
      MetricData: [{
        Dimensions: [{ Name: 'DomType', Value: matchupDomType }],
        MetricName: 'MatchupDomTypeDiscovered',
        Unit: 'Count',
        Value: 1,
      }],
      Namespace,
    }).promise();
  }

  async recordSuccessCount(runFinished = true) {
    return _(this).cloudWatch.putMetricData({
      MetricData: [{
        MetricName: 'SuccessfulEtlRun',
        Unit: 'Count',
        Value: runFinished ? 1 : 0,
      }],
      Namespace,
    }).promise();
  }
}
