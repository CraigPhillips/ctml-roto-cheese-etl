const _ = require('privatize')();
const puppeteerLib = require('puppeteer');
const VError = require('verror');

class ActionTypes {
  constructor() {
    this.browseTo = Symbol('fe-cheese-puppeteer-browse-to');
    this.enterText = Symbol('fe-cheese-puppeteer-enter-text');
    this.click = Symbol('fe-cheese-puppeteer-click');
    this.getAtts = Symbol('fe-cheese-puppeteer-get-attributes');
    this.getText = Symbol('fe-cheese-puppeteer-get-text');
  }
};
const actionType = new ActionTypes();

const timeout = 10000;

async function getBrowser(from) {
  if (!_(from).browser) {
    _(from).browser = await _(from).puppeteer.launch({ headless: true });
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
    let lastActionSeen;
    let page;
    try {
      const toDos = actions && actions.length? actions : [actions];
      const browser = await getBrowser(this);
      page = await browser.newPage();
      const values = [];

      for (let i of toDos.keys()) {
        const action = toDos[i];
        const errorPrefix = `action ${i + 1}`;
        const subValues = [];
        if (!action.type) throw new Error(`${errorPrefix} missing type`);

        lastActionSeen = action;
        switch(action.type)
        {
          case actionType.browseTo:
            if (!action.url) throw new Error(`${errorPrefix} missing URL`);

            await page.goto(action.url);
            break;
          case actionType.click:
            if (!action.field) throw new Error(`${errorPrefix} missing field`);

            await page.waitForSelector(action.field,  { timeout });
            const clickTarget = await page.$(action.field);
            await clickTarget.click();
            break;
          case actionType.enterText:
            if (!action.field) throw new Error(`${errorPrefix} missing field`);
            if (!action.value) throw new Error(`${errorPrefix} missing value`);

            await page.waitForSelector(action.field, { timeout });
            const textTarget = await page.$(action.field);
            await textTarget.type(action.value);
            break;
          case actionType.getAtts:
          case actionType.getText:
            if (!action.field) throw new Error(`${errorPrefix} missing field`);
            if (action.type === actionType.getAtts && !action.att) {
              throw new Error(`${errorPrefix} missing attribute`);
            }

            await page.waitForSelector(action.field, { timeout });
            const selectedFields = await page.$$(action.field);
            for (const field of selectedFields) {
              const value = action.type === actionType.getAtts ?
                await page.evaluate((el, att) => {
                  return el.getAttribute(att);
                }, field, action.att) :
                await page.evaluate((el) => {
                  return el.textContent;
                }, field);
              subValues.push(value? value.trim() : value);
            }
            break;
          default:
            throw new Error(`unknown action type: ${action.type.toString()}`);
        }

        if (subValues.length > 0 ) {
          values.push(subValues.length === 1? subValues[0] : subValues);
        }
      }
      return values.length === 1? values[0] : values;
    } catch(actionError) {
      console.log('error triggered during: ', lastActionSeen);
      if (page) await page.screenshot({ path: 'errored.png' });
      throw new VError(actionError, 'error while executing actions');
    }
  }
};

module.exports = {
  actionType,
  Puppeteer
};
