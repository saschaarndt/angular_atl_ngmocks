import { ComponentHarness } from '@angular/cdk/testing';

import { TodoTextInputHarness } from '../todo-text-input/todo-text-input.harness';

export class TodoSidebarHarness extends ComponentHarness {
  static hostSelector = 'app-todo-sidebar';

  readonly #getListInput = this.locatorFor(TodoTextInputHarness);
  readonly #getAddButton = this.locatorFor('button.todo-sidebar__add-button');

  async getListNames(): Promise<string[]> {
    const buttons = await this.locatorForAll('button.todo-sidebar__tab')();
    return Promise.all(buttons.map((button) => button.text()));
  }

  async getActiveListName(): Promise<string | null> {
    const active = await this.locatorForOptional('button.todo-sidebar__tab--active')();
    return active ? active.text() : null;
  }

  async selectList(name: string): Promise<void> {
    const buttons = await this.locatorForAll('button.todo-sidebar__tab')();
    for (const button of buttons) {
      if ((await button.text()).trim() === name) {
        await button.click();
        return;
      }
    }

    throw Error(`List button not found: ${name}`);
  }

  async removeList(name: string): Promise<void> {
    const button = await this.locatorFor(`button[aria-label="Liste löschen: ${name}"]`)();
    await button.click();
  }

  async hasRemoveButton(name: string): Promise<boolean> {
    return (
      (await this.locatorForOptional(`button[aria-label="Liste löschen: ${name}"]`)()) !== null
    );
  }

  async addList(name: string): Promise<void> {
    const input = await this.#getListInput();
    await input.setValue(name);
    await (await this.#getAddButton()).click();
  }

  async getListInputHarness(): Promise<TodoTextInputHarness> {
    return this.#getListInput();
  }
}
