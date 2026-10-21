import { S3Client } from '@aws-sdk/client-s3';
import {
  APP_ENV,
  S3_ACCESS_KEY_ID,
  S3_ENDPOINT,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
} from '../config/env.js';
import { db, pool } from './index.js';
import { assertStagingSeedAllowed, seedStaging } from './stagingSeed.js';

assertStagingSeedAllowed(APP_ENV);

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
});

try {
  const { organisersCreated, ridesCreated } = await seedStaging(db, s3);
  console.log(`Staging seed: ${organisersCreated} organisers and ${ridesCreated} Rides created`);
} catch (error) {
  console.error('Staging seed failed', error);
  process.exitCode = 1;
} finally {
  s3.destroy();
  await pool.end();
}
