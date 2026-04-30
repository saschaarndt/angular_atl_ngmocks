import { vi } from 'vitest';

const bootstrapApplication = vi.fn();

vi.mock('@angular/platform-browser', () => ({
  bootstrapApplication,
}));

describe('main', () => {
  beforeEach(() => {
    vi.resetModules();
    bootstrapApplication.mockReset();
  });

  it('bootstrapped die App mit der App-Konfiguration', async () => {
    bootstrapApplication.mockResolvedValueOnce(undefined);

    const [{ App }, { appConfig }] = await Promise.all([
      import('./app/app'),
      import('./app/app.config'),
    ]);
    await import('./main');

    expect(bootstrapApplication).toHaveBeenCalledWith(App, appConfig);
  });

  it('loggt Bootstrap-Fehler', async () => {
    const error = new Error('bootstrap failed');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    bootstrapApplication.mockRejectedValueOnce(error);

    await import('./main');
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    consoleErrorSpy.mockRestore();
  });
});
