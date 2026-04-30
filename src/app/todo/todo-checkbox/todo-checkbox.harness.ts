import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface TodoCheckboxHarnessFilters extends BaseHarnessFilters {
  label?: string;
}

export class TodoCheckboxHarness extends ComponentHarness {
  static hostSelector = 'app-todo-checkbox';

  static with(options: TodoCheckboxHarnessFilters = {}): HarnessPredicate<TodoCheckboxHarness> {
    return new HarnessPredicate(TodoCheckboxHarness, options).addOption(
      'label',
      options.label,
      async (harness, label) => (await harness.getLabel()) === label,
    );
  }

  readonly #getButton = this.locatorFor('button.todo-checkbox');

  async toggle(): Promise<void> {
    await (await this.#getButton()).click();
  }

  async isChecked(): Promise<boolean> {
    return (await (await this.#getButton()).getAttribute('aria-checked')) === 'true';
  }

  async isDisabled(): Promise<boolean> {
    return Boolean(await (await this.#getButton()).getProperty('disabled'));
  }

  async getLabel(): Promise<string | null> {
    return (await this.#getButton()).getAttribute('aria-label');
  }
}
