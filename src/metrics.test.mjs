import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import Metrics from './metrics.mjs';

chai.should();
chai.use(chaiAsPromised);

describe('Metrics', () => {
  const cloudWatch = { putMetricData: () => {} };

  let metrics;
  let stubs;

  beforeEach(() => {
    stubs = {
      putMetricData: sinon
        .stub(cloudWatch, 'putMetricData')
        .returns({ promise: () => Promise.resolve() }),
    };

    metrics = new Metrics(cloudWatch);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should send metric data', async () => {
    await metrics.recordMatchupDomType('fake-dom-type');

    sinon.assert.calledWith(stubs.putMetricData, {
      MetricData: [{
        Dimensions: [{ Name: 'DomType', Value: 'fake-dom-type' }],
        MetricName: 'MatchupDomTypeDiscovered',
        Unit: 'Count',
        Value: 1,
      }],
      Namespace: 'CtmlRotoCheese',
    });
  });
});
