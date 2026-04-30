import '../test-setup';
import { ngMocks } from 'ng-mocks';
import { appConfig } from './app.config';

describe('appConfig', () => {
  ngMocks.faster();

  it('registriert die erwarteten Provider', () => {
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers).toHaveLength(3);
  });
});
