import { ComponentHarness } from '@angular/cdk/testing';

import { TodoCheckboxHarness } from '../todo-checkbox/todo-checkbox.harness';
import { TodoTextInputHarness } from '../todo-text-input/todo-text-input.harness';

export class TodoListHarness extends ComponentHarness {
  static hostSelector = 'app-todo-list';

  readonly #getInput = this.locatorFor(TodoTextInputHarness);
  readonly #getAddButton = this.locatorFor('button.todo-list__add-button');

  async getCurrentTodoTitles(): Promise<string[]> {
    const titles = await this.locatorForAll('.todo-list__title')();
    return Promise.all(titles.map((title) => title.text()));
  }

  async addTodo(title: string): Promise<void> {
    const input = await this.#getInput();
    await input.setValue(title);
    await (await this.#getAddButton()).click();
  }

  async getOpenCountText(): Promise<string | null> {
    const count = await this.locatorForOptional('.todo-list__count')();
    return count ? count.text() : null;
  }

  async setFilter(filter: 'all' | 'active' | 'completed'): Promise<void> {
    const labels: Record<typeof filter, string> = {
      all: 'Alle',
      active: 'Aktiv',
      completed: 'Erledigt',
    };
    const buttons = await this.locatorForAll('button.todo-list__filter-button')();
    for (const current of buttons) {
      if ((await current.text()).trim() === labels[filter]) {
        await current.click();
        return;
      }
    }

    throw Error(`Filter button not found: ${filter}`);
  }

  async getActiveFilter(): Promise<'all' | 'active' | 'completed' | null> {
    const active = await this.locatorForOptional('button.todo-list__filter-button--active')();
    if (!active) {
      return null;
    }

    switch ((await active.text()).trim()) {
      case 'Alle':
        return 'all';
      case 'Aktiv':
        return 'active';
      case 'Erledigt':
        return 'completed';
      default:
        return null;
    }
  }

  async toggleTodo(title: string): Promise<void> {
    const checkbox = await this.locatorFor(
      TodoCheckboxHarness.with({ label: `Aufgabe als erledigt markieren: ${title}` }),
    )();
    await checkbox.toggle();
  }

  async removeTodo(title: string): Promise<void> {
    await (await this.locatorFor(`button[aria-label="Aufgabe löschen: ${title}"]`)()).click();
  }

  async clearCompleted(): Promise<void> {
    const button = await this.locatorForOptional('button.todo-list__clear-button')();
    if (button) {
      await button.click();
    }
  }

  async hasEmptyState(): Promise<boolean> {
    return (await this.locatorForOptional('.todo-list__empty')()) !== null;
  }

  async getInputHarness(): Promise<TodoTextInputHarness> {
    return this.#getInput();
  }
}
