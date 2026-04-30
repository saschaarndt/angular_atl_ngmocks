import { ComponentHarness } from '@angular/cdk/testing';

import { TodoCardHarness } from '../todo-card/todo-card.harness';
import { TodoSidebarHarness } from '../todo-sidebar/todo-sidebar.harness';

export class TodoBoardHarness extends ComponentHarness {
  static hostSelector = 'app-todo-board';

  readonly #getSidebar = this.locatorFor(TodoSidebarHarness);
  readonly #getCard = this.locatorForOptional(TodoCardHarness);

  async getTitle(): Promise<string> {
    return (await this.locatorFor('.board__title')()).text();
  }

  async getClaim(): Promise<string> {
    return (await this.locatorFor('.board__claim')()).text();
  }

  async addList(name: string): Promise<void> {
    const sidebar = await this.#getSidebar();
    await sidebar.addList(name);
  }

  async selectList(name: string): Promise<void> {
    const sidebar = await this.#getSidebar();
    await sidebar.selectList(name);
  }

  async removeList(name: string): Promise<void> {
    const sidebar = await this.#getSidebar();
    await sidebar.removeList(name);
  }

  async hasCard(): Promise<boolean> {
    return (await this.#getCard()) !== null;
  }

  async getCardHarness(): Promise<TodoCardHarness | null> {
    return this.#getCard();
  }

  async getSidebarHarness(): Promise<TodoSidebarHarness> {
    return this.#getSidebar();
  }
}
