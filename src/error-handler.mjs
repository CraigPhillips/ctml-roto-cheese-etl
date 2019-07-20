
// import beThere from 'be-there.js'
import p from 'private-parts';
import shell from 'shelljs';

async function saveScreenshotToDisk(page, storagePath, log) {
  // beThere({ page, storagePath });
  const suffix = storagePath.endsWith('/') ? '' : '/';
  const path = `${storagePath}${suffix}${(new Date()).toISOString()}.png`;
  log.debug('saving error screenshot to disk', { path });
  shell.mkdir('-p', storagePath);

  await page.screenshot({ fullPage: true, path });
}

async function saveScreenshotToS3(page, s3, s3Bucket, s3Key = '', log) {
  // beThere({ page, s3Bucket });
  const suffix = !s3Key || s3Key.endsWith('/') ? '' : '/';
  const Bucket = s3Bucket;
  const Key = `${s3Key}${suffix}${(new Date()).toISOString()}.png`;
  const request = {
    Body: await page.screenshot({ fullPage: true }),
    Bucket,
    Key,
  };
  log.debug('saving error screenshot to S3', { Bucket, Key });
  await s3.putObject(request).promise();
}

const _ = p.createKey();
export default class ErrorHandler {
  constructor(config, log, s3) {
    // beThere({ config });
    Object.assign(_(this), { config, log, s3 });
  }

  async handle(error = new Error('no error given to handler'), page) {
    const { log, s3 } = _(this);
    log.debug('handling error', { error });

    try {
      if (page) {
        const c = _(this).config;
        const storageType = c
          && c.errorScreenshotStorage && c.errorScreenshotStorage.type
          ? c.errorScreenshotStorage.type.toLowerCase() : '(missing)';

        switch (storageType) {
          case 'local': {
            const storagePath = c.errorScreenshotStorage.location || '.';
            await saveScreenshotToDisk(page, storagePath, log);
            break;
          }
          case 's3': {
            const s3Key = c.errorScreenshotStorage.location;
            const { s3Bucket } = c.errorScreenshotStorage;
            if (!s3Bucket) log.error('no S3 bucket for screenshot storage');
            else await saveScreenshotToS3(page, s3, s3Bucket, s3Key, log);
            break;
          }
          default:
            log.error('bad error screenshot storage type set', { storageType });
        }
      } else log.error('no page object to capture error screenshot');
    } catch (screenshotError) {
      log.error('failed to save screenshot', { screenshotError });
    }
  }
}
