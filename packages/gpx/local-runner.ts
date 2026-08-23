import fs from 'fs';
import { parseGPX } from './src/index.js';

const gpxFile = fs.readFileSync('./assets/route-multisegment.gpx');

const { distanceKm, ascentM, descentM, pointCount, name, simplifiedTrack } = parseGPX(
  gpxFile.toString(),
);

console.log({ distanceKm, ascentM, descentM, pointCount, name });

console.log('simplifiedTrack first point', simplifiedTrack[0]);
