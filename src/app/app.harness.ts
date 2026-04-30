import { ComponentHarness } from '@angular/cdk/testing';

export class AppHarness extends ComponentHarness {
  static hostSelector = 'app-root, div[id^="root"]';

  readonly #getRouterOutlet = this.locatorForOptional('router-outlet');

  async hasRouterOutlet(): Promise<boolean> {
    return (await this.#getRouterOutlet()) !== null;
  }
}
