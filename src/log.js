import privacy from 'private-parts';
import winstonImplementation from 'winston';

let _;
export const service = 'ctml-roto-cheese-etl';
export default class Log {
  constructor({
    formatForCLIs = false,
    prettyPrintJSON = false,
    winston = winstonImplementation,
  } = {}) {
    if (!_) _ = privacy.createKey();

    let format = winston.format.cli();
    if (!formatForCLIs) {
      const formats = [
        winston.format.json(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
      ];
      if (prettyPrintJSON) formats.push(winston.format.prettyPrint());
      format = winston.format.combine(...formats);
    }

    const level = process.env.LOG_LEVEL || 'debug';
    Object.assign(_(this), {
      logger: winston.createLogger({
        level,
        format,
        defaultMeta: { service },
        transports: [
          new winston.transports.Console({ level }),
        ],
      }),
    });
  }

  debug(msg, data) { _(this).logger.debug(msg, data); }

  error(msg, data) { _(this).logger.error(msg, data); }

  info(msg, data) { _(this).logger.info(msg, data); }

  warn(msg, data) { _(this).logger.warn(msg, data); }
}
