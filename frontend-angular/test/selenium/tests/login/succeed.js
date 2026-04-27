import Login from '../../pages/Login.js';
import createDriver from '../../utilities/driver.js';

let loginPage;

describe('Login Page', () => {
  beforeAll(async () => {
    const driver = await createDriver();
    loginPage = new Login(driver);
    await loginPage.open();
  });

  afterAll(async () => {
    await loginPage.driver.quit();
  });

  it('should display the login page', async () => {
    const loaded = await loginPage.isLoaded();
    expect(loaded).toBe(true);
  });
});

