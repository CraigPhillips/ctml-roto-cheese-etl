import privacy from 'private-parts';

let _;
export default class Metrics {
  constructor(cloudWatch) {
    if (!_) _ = privacy.createKey();

    Object.assign(_(this), {
      cloudWatch,
    });
  }

  async recordMatchupDomType(matchupDomType) {
    return _(this).cloudWatch.putMetricData({
      MetricData: [{
        Dimensions: [{ Name: 'DomType', Value: matchupDomType }],
        MetricName: 'MatchupDomTypeDiscovered',
        Unit: 'Count',
        Value: 1,
      }],
      Namespace: 'CtmlRotoCheese',
    }).promise();
  }
}
