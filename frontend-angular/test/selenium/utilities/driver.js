import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';

export default async function createDriver() {
    const driver =  await new Builder().forBrowser('firefox').build();
    return driver;
}

