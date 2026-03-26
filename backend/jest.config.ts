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
  collectCoverage: true,
    collectCoverageFrom: [
    'src/**/*.(t|j)s',

    // ❌ excluir DTOs
    '!src/**/*.dto.ts',

    // ❌ excluir entities
    '!src/**/*.entity.ts',

    // ❌ excluir carpetas completas
    '!src/**/entities/**',
    '!src/**/dto/**',
    '!src/**/controller/**',

    // ❌ archivos que no aportan lógica
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/app.controller.ts',
    '!src/app.service.ts',
    '!src/**/coverage/**',
    '!src/facturacion/tests/**',
    '!src/service/auth/**'
  ]
};

export default config;
