import '../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { render } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { ngMocks } from 'ng-mocks';

import { AppHarness } from './app.harness';
import { App } from './app';

describe('AppHarness', () => {
  ngMocks.faster();

  it('findet das Router-Outlet im App-Host', async () => {
    const { fixture } = await render(App, {
      providers: [provideRouter([])],
    });
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness);

    await expect(harness.hasRouterOutlet()).resolves.toBe(true);
  });
});
