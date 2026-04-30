import '../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { render } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { ngMocks } from 'ng-mocks';

import { AppHarness } from './app.harness';
import { App } from './app';

describe('App', () => {
  ngMocks.faster();

  it('erstellt die Root-Komponente', async () => {
    const { fixture } = await render(App, {
      providers: [provideRouter([])],
    });
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness);

    expect(fixture.componentInstance).toBeTruthy();
    await expect(harness.hasRouterOutlet()).resolves.toBe(true);
  });
});
