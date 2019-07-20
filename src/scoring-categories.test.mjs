import chai from 'chai';

import categories from './scoring-categories';

chai.should();

describe('scoringCategories', () => {
  it('should list all cats. except ERA & WHIP as "bigger is better"', () => {
    Object.entries(categories).forEach(([category, definition]) => {
      definition.biggerIsBetter.should.equal(
        category !== 'era' && category !== 'whip',
      );
    });
  });
});
