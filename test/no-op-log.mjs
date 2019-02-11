export default class NoOpLog {
  constructor() {
    Object.assign(this, {
      debugs: [],
      errors: [],
      infos: [],
      warns: [],
    });
  }

  debug(...args) { this.debugs.push(args); }

  error(...args) { this.errors.push(args); }

  info(...args) { this.infos.push(args); }

  warn(...args) { this.warns.push(args); }
}
