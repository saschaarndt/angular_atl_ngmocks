import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

import { TodoBoardStore } from '../+store/todo-board.store';
import { TodoCard } from '../todo-card/todo-card';
import { TodoSidebar } from '../todo-sidebar/todo-sidebar';

@Component({
  selector: 'app-todo-board',
  imports: [TodoCard, FontAwesomeModule, TodoSidebar],
  templateUrl: './todo-board.html',
  styleUrl: './todo-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoBoard {
  readonly #document = inject(DOCUMENT);
  readonly #todoListsStore = inject(TodoBoardStore);

  readonly logoIcon = faCheck;
  readonly plusIcon = faPlus;
  readonly closeIcon = faXmark;

  readonly lists = this.#todoListsStore.lists;
  readonly activeListId = signal<number>(this.#todoListsStore.lists()[0]?.id ?? 0);
  readonly activeList = computed(() => this.lists().find((l) => l.id === this.activeListId()));

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  addList(): void {
    const name = this.form.controls.name.value.trim();
    if (!name) return;

    const list = this.#todoListsStore.addList(name);
    this.activeListId.set(list.id);
    this.form.reset();
    this.#focusTodoInput(list.id);
  }

  removeList(id: number): void {
    const activeListId = this.activeListId();
    this.#todoListsStore.removeList(id);
    const remaining = this.lists();
    if (remaining.length === 0) {
      this.activeListId.set(0);
      this.#focusElement('new-list');
      return;
    }

    const nextListId = activeListId === id ? remaining[0].id : activeListId;

    if (activeListId === id) {
      this.activeListId.set(nextListId);
    }

    this.#focusElement(`todo-tab-${nextListId}`);
  }

  switchList(id: number): void {
    this.activeListId.set(id);
    this.#focusTodoInput(id);
  }

  #focusTodoInput(listId: number): void {
    this.#focusElement(`new-todo-${listId}`);
  }

  #focusElement(elementId: string): void {
    setTimeout(() => {
      const element = this.#document.getElementById(elementId);
      if (element instanceof HTMLElement) {
        element.focus();
      }
    });
  }
}
