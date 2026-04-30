import './test-setup';
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

    await import('./main');

    expect(bootstrapApplication).toHaveBeenCalledTimes(1);

    const [appComponent, appConfig] = bootstrapApplication.mock.calls[0] ?? [];

    expect(appComponent).toBeTypeOf('function');
    expect(appComponent?.ɵcmp).toBeDefined();
    expect(appComponent?.ɵcmp?.selectors).toEqual([['app-root']]);
    expect(appConfig).toMatchObject({
      providers: expect.any(Array),
    });
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
