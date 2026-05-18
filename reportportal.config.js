import { defineConfig } from '@playwright/test';

export default defineConfig({

  reporter: [

    ['html'],

    ['list'],

    ['@reportportal/agent-js-playwright', {

      apiKey: 'TU_API_KEY',

      endpoint: 'http://localhost:8080/api/v1',

      project: 'default_personal',

      launch: 'Playwright Launch',

      description: 'Testing comm systems',

      attributes: [
        {
          key: 'env',
          value: 'dev'
        }
      ]
    }]
  ]
});