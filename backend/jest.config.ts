import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // 🔥 ESTA LÍNEA ES LA CLAVE
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['<rootDir>/src/service/**/*.spec.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
};

export default config;
