import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // 🔥 ESTA LÍNEA ES LA CLAVE
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['<rootDir>/test/unitaria/**/*.spec.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  collectCoverage: true,
      collectCoverageFrom: [
    "src/service/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/"
  ],
  coverageDirectory: "coverage"
};

export default config;
