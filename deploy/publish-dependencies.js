import fs from 'fs';
import stream from 'stream';
import util from 'util';

import archiver from 'archiver';
import beThere from 'be-there';
import logUpdate from 'log-update';
import md5 from 'md5';

const compressingPrefix = 'compressing dependencies:';

function streamZipToS3(s3Client, Bucket, Key, log) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipStream = new stream.PassThrough();

    let lastPercent = 0;
    archive.on('progress', (data) => {
      const newPercent = (
        100 * data.entries.processed / data.entries.total
      ).toFixed(1);

      if (lastPercent !== newPercent) {
        lastPercent = newPercent;
        logUpdate(`${compressingPrefix} ${lastPercent}%`);
      }
    });
    archive.on('warning', (archiverWarning) => {
      logUpdate.done();
      log.warn('warning creating dependency archive', { archiverWarning });
      reject(archiverWarning);
    });
    archive.on('error', (archiverError) => {
      logUpdate.done();
      log.error('error creating dependency archive', { archiverError });
      reject(archiverError);
    });
    archive.on('finish', () => {
      logUpdate(`${compressingPrefix} done, finishing upload to S3`);
      logUpdate.done();
    });

    archive.pipe(zipStream);
    fs.readdirSync('node_modules').forEach((dir) => {
      if (dir !== 'puppeteer') {
        archive.directory(`node_modules/${dir}`, `nodejs/node_modules/${dir}`);
      }
    });
    fs.readdirSync('node_modules/puppeteer').forEach((entry) => {
      if (fs.lstatSync(`node_modules/puppeteer/${entry}`).isFile()) {
        archive.file(
          `node_modules/puppeteer/${entry}`,
          { name: `nodejs/node_modules/puppeteer/${entry}` },
        );
      } else if (entry !== '.local-chromium') {
        archive.directory(
          `node_modules/puppeteer/${entry}`,
          `nodejs/node_modules/puppeteer/${entry}`,
        );
      }
    });
    archive.finalize();

    s3Client.upload({ Bucket, Key, Body: zipStream }, (err) => {
      if (err) {
        logUpdate.done();
        reject(err);
      } else {
        logUpdate('dependencies published to S3');
        logUpdate.done();
        resolve();
      }
    });
  });
}

export default async function publishDependencies(config, s3Client, log) {
  beThere({ config, log, s3Client });

  const Bucket = config.deployment.s3Bucket;
  const hash = md5(await util.promisify(fs.readFile)('package-lock.json'));
  let s3PathPrefix = config.deployment.s3DependenciesPath;
  if (!s3PathPrefix.endsWith('/')) s3PathPrefix += '/';
  const Key = `${s3PathPrefix}${hash}.zip`;

  try {
    log.info('checking for dependencies in S3', { Bucket, Key });
    await s3Client.headObject({ Bucket, Key }).promise();
    log.info('dependencies already published to S3', { Bucket, Key });
  } catch (error) {
    log.info('dependencies not found in S3', { Bucket, Key });
    await streamZipToS3(s3Client, Bucket, Key, log);
  }
  return { Bucket, hash, Key };
}
