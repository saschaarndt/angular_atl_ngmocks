import { ComponentHarness } from '@angular/cdk/testing';

import { TodoListHarness } from '../todo-list/todo-list.harness';

export class TodoCardHarness extends ComponentHarness {
  static hostSelector = 'app-todo-card';

  readonly #getSection = this.locatorFor('section.todo-card');
  readonly #getTodoList = this.locatorFor(TodoListHarness);

  async getListName(): Promise<string | null> {
    return (await this.#getSection()).getAttribute('aria-label');
  }

  async getTodoListHarness(): Promise<TodoListHarness> {
    return this.#getTodoList();
  }
}
