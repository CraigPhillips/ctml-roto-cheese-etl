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

function isAPage(possiblePage) {
  return possiblePage &&
    possiblePage.$eval &&
    possiblePage.evaluate &&
    possiblePage.goto &&
    possiblePage.screeshot &&
    possiblePage.waitForSelector;
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
    if (!actionTypeToTake) throw new Error('action to take is required');

    const browser = await getBrowser(this);
    const pageProvided = isAPage(params[0]);
    const page = pageProvided ? params[0] : await browser.newPage();

    switch(actionTypeToTake)
    {
      case actionType.browseTo:
        const url = pageProvided ? params[1] : params[0];
        if (!url) throw new Error('missing browsing URL');
        await page.goto(url);
        break;
      default:
        throw new Error(`unknown action type: ${actionTypeToTake.toString()}`);
    }
  }
};

module.exports = {
  actionType,
  Puppeteer
};
