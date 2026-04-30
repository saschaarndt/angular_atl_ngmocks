import { render } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  it('erstellt die Root-Komponente', async () => {
    const { fixture } = await render(App, {
      providers: [provideRouter([])],
    });

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
