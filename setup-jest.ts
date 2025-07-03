import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

globalThis.structuredClone = val => JSON.parse(JSON.stringify(val))

setupZoneTestEnv();
