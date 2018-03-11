const _ = require('privatize')();
const puppeteerLib = require('puppeteer');

class ActionTypes {
  constructor() {
    this.browseTo = Symbol('fe-cheese-puppeteer-browse-to');
    this.enterText = Symbol('fe-cheese-puppeteer-enter-text');
    this.click = Symbol('fe-cheese-puppeteer-click');
  }
};
const actionType = new ActionTypes();

async function getBrowser(from) {
  if (!_(from).browser) {
    _(from).browser = await _(from).puppeteer.launch({ headless: false });
  }
  return _(from).browser;
}

function isAPage(thing) {
  return thing &&
    thing.$eval &&
    thing.evaluate &&
    thing.goto &&
    thing.screeshot &&
    thing.waitForSelector;
}

class Puppeteer {
  constructor(puppeteer = puppeteerLib) {
    _(this).puppeteer = puppeteer;
  }

  async dispose() {
    const browser = await getBrowser(this);
    await browser.close();
  }

  async do(actionTypeToTake, ...params) {
    return await this.then(actionTypeToTake, ...params);
  }

  async then(actionTypeToTake, ...params) {
    // try again
  }
};

module.exports = {
  actionType,
  Puppeteer
};
