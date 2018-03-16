const _ = require('privatize')();

class ScoringCategories {
  constructor() {
    const batting = Symbol('batting');
    const pitching = Symbol('pitching');

    this.types = { batting, pitching };

    _(this).abbrevMap = {
      avg: { biggerIsBetter: true, name: 'Batting Average', type: batting },
      era: { biggerIsBetter: false, name: 'Earned Run Average', type: pitching},
      hr: { biggerIsBetter: true, name: 'Home Runs', type: batting },
      k: { biggerIsBetter: true, name: 'Strikeouts', type: pitching },
      r: { biggerIsBetter: true, name: 'Runs', type: batting },
      rbi: { biggerIsBetter: true, name: 'Runs Batted In', type: batting },
      sv: { biggerIsBetter: true, name: 'Saves', type: pitching },
      sb: { biggerIsBetter: true, name: 'Stolen Bases', type: batting },
      w: { biggerIsBetter: true, name: 'Wins', type: pitching },
      whip: { biggerIsBetter: false, name: 'WHIP', type: pitching },
    };
  }

  all() { return Object.keys(_(this).abbrevMap); }

  batting() { return this.ofType(this.types.batting); }

  detailsFor(abbrev) { return _(this).abbrevMap[abbrev]; }

  ofType(type) {
    return Object.keys(_(this).abbrevMap)
      .filter(c => _(this).abbrevMap[c].type === type);
  }

  pitching() { return this.ofType(this.types.pitching); }
};

module.exports = { categories: new ScoringCategories() };
