const _ = require('privatize')();
const puppeteerLib = require('puppeteer');
const VError = require('verror');

class ActionTypes {
  constructor() {
    this.browseTo = Symbol('fe-cheese-puppeteer-browse-to');
    this.enterText = Symbol('fe-cheese-puppeteer-enter-text');
    this.click = Symbol('fe-cheese-puppeteer-click');
    this.getAtts = Symbol('fe-cheese-puppeteer-get-attributes');
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

      for (let i of toDos.keys()) {
        const action = toDos[i];
        const errorPre = `action ${i + 1}`;
        if (!action.type) throw new Error(`${errorPre} missing type`);

        switch(action.type)
        {
          case actionType.browseTo:
            if (!action.url) throw new Error(`${errorPre} missing URL`);
            await page.goto(action.url);
            break;
          case actionType.click:
            if (!action.field) throw new Error(`${errorPre} missing field`);
            await page.waitForSelector(action.field);
            const clickTarget = await page.$(action.field);
            await clickTarget.click();
            break;
          case actionType.enterText:
            if (!action.field) throw new Error(`${errorPre} missing field`);
            if (!action.value) throw new Error(`${errorPre} missing value`);
            await page.waitForSelector(action.field);
            const textTarget = await page.$(action.field);
            await textTarget.type(action.value);
            break;
          case actionType.getAtts:
            if (!action.field) throw new Error(`${errorPre} missing field`);
            if (!action.att) throw new Error(`${errorPre} missing attribute`);
            await page.waitForSelector(action.field);
            const selectedFields = await page.$$(action.field);
            /*console.log(selectedFields.length);
            console.log(action.field);
            for (const field of selectedFields) {
              const valueHandle = await field.getProperty(action.att);
              console.log(await valueHandle.jsonValue());
            }*/

            let input = await page.$('#matchupweek');
            let valueHandle = await input.getProperty('id');
            console.log(await valueHandle.jsonValue());
            break;
          default:
            throw new Error(`unknown action type: ${actionTypeToTake}`);
        }
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
