import fs from 'fs';
import stream from 'stream';
import util from 'util';

import archiver from 'archiver';
import beThere from 'be-there';
import md5 from 'md5';
import * as babel from '@babel/core';

function streamSrcToS3(s3Client, Bucket, Key, src, log) {
  beThere({ s3Client, Bucket, Key, src, log });

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipStream = new stream.PassThrough();

    archive.on('warning', (archiverWarning) => {
      log.warn('warning creating archive', { archiverWarning });
      reject(archiverWarning);
    });
    archive.on('error', (archiverError) => {
      log.error('error creating archive', { archiverError });
      reject(archiverError);
    });

    archive.pipe(zipStream);
    Object.entries(src).forEach(([file, contents]) => {
      archive.append(contents, { name: file.replace('.mjs', '.js') });
    });
    archive.finalize();
    log.info('compressing and publishing src package to S3', { Bucket, Key });

    s3Client.upload({ Bucket, Key, Body: zipStream }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function publishSrc(config, s3Client, log) {
  beThere({ config, log, s3Client });

  const srcFiles = await util.promisify(fs.readdir)('src');
  const srcContents = await Promise.all(srcFiles.map(
    srcFile => util.promisify(fs.readFile)(`src/${srcFile}`),
  ));
  const src = srcFiles.reduce(
    (soFar, srcFile, srcFileI) => Object.assign(
      {}, soFar, { [srcFile]: srcContents[srcFileI] },
    ),
    {},
  );
  const hash = md5(
    Object.values(src).reduce((soFar, nextSrc) => soFar + nextSrc, ''),
  );

  log.info('transpiling source');
  await Promise.all(Object.keys(src).map(async (srcFile) => {
    const { code } = await util.promisify(babel.default.transform)(
      src[srcFile].toString().split('.mjs').join('.js'),
      {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { chrome: 52 },
            },
          ],
        ],
      },
    );
    src[srcFile] = code;
  }));

  const Bucket = config.deployment.s3Bucket;
  let s3PathPrefix = config.deployment.s3SrcPath;
  if (!s3PathPrefix.endsWith('/')) s3PathPrefix += '/';
  const Key = `${s3PathPrefix}${hash}.zip`;

  try {
    log.info('checking for src package in S3', { Bucket, Key });
    await s3Client.headObject({ Bucket, Key }).promise();
    log.info('src package already published to S3', { Bucket, Key });
  } catch (error) {
    log.info('src package not found in S3', { Bucket, Key });
    await streamSrcToS3(s3Client, Bucket, Key, src, log);
  }

  return { Bucket, hash, Key };
}
