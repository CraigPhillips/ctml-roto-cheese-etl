const _ = require('privatize')();
const puppeteerLib = require('puppeteer');
const VError = require('verror');

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

class Puppeteer {
  constructor(puppeteer = puppeteerLib) {
    _(this).puppeteer = puppeteer;
  }

  async dispose() {
    const browser = await getBrowser(this);
    await browser.close();
  }

  async do(actions) {
    try {
      const toDos = actions && actions.length? actions : [actions];
      const browser = await getBrowser(this);
      const page = await browser.newPage();

      let i = 1;
      for (let action of toDos) {
        if (!action.type) throw new Error(`action ${i} missing type`);

        switch(action.type)
        {
          case actionType.browseTo:
            if (!action.url) throw new Error(`action ${i} missing URL`);
            await page.goto(action.url);
            break;
          default:
            throw new Error(`unknown action type: ${actionTypeToTake}`);
        }

        i++;
      }
    } catch(actionError) {
      throw new VError(actionError, 'error while executing actions');
    }
  }
};

module.exports = {
  actionType,
  Puppeteer
};
