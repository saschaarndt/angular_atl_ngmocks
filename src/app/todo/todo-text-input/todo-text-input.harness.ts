import { ComponentHarness } from '@angular/cdk/testing';

export class TodoTextInputHarness extends ComponentHarness {
  static hostSelector = 'app-todo-text-input';

  readonly #getInput = this.locatorFor('input');
  readonly #getLabel = this.locatorFor('label');

  async getLabelText(): Promise<string> {
    return (await this.#getLabel()).text();
  }

  async getValue(): Promise<string> {
    return String(await (await this.#getInput()).getProperty('value'));
  }

  async setValue(value: string): Promise<void> {
    const input = await this.#getInput();
    await input.clear();
    if (value) {
      await input.sendKeys(value);
    }
  }

  async focus(): Promise<void> {
    await (await this.#getInput()).focus();
  }

  async blur(): Promise<void> {
    await (await this.#getInput()).blur();
  }

  async isDisabled(): Promise<boolean> {
    return Boolean(await (await this.#getInput()).getProperty('disabled'));
  }

  async getPlaceholder(): Promise<string | null> {
    return (await this.#getInput()).getAttribute('placeholder');
  }

  async getAutocomplete(): Promise<string | null> {
    return (await this.#getInput()).getAttribute('autocomplete');
  }

  async isKeyboardFocused(): Promise<boolean> {
    return (await this.#getInput()).hasClass('todo-text-input__control--keyboard-focused');
  }
}
