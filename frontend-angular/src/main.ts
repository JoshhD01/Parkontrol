import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function bootstrapApp(): Promise<void> {
  try {
    await bootstrapApplication(App, appConfig);
  } catch (err) {
    console.error(err);
  }
}

void bootstrapApp(); // NOSONAR: top-level await is not available for current browser targets.
