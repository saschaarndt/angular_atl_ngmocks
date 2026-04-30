import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registriert die erwarteten Provider', () => {
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers).toHaveLength(3);
  });
});
