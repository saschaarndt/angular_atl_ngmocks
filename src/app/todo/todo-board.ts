import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faPlus, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';

import { TodoCard } from './todo-card';
import { TodoBoardStore } from './todo-board.store';
import { TodoTextInput } from './todo-text-input';

@Component({
  selector: 'app-todo-board',
  imports: [TodoCard, ReactiveFormsModule, FontAwesomeModule, TodoTextInput],
  templateUrl: './todo-board.html',
  styleUrl: './todo-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoBoard {
  readonly #document = inject(DOCUMENT);
  readonly #todoListsStore = inject(TodoBoardStore);

  readonly logoIcon = faCheck;
  readonly plusIcon = faPlus;
  readonly deleteIcon = faTrashCan;
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
    if (name) {
      const list = this.#todoListsStore.addList(name);
      this.activeListId.set(list.id);
      this.form.reset();
      this.#focusTodoInput(list.id);
    }
  }

  removeList(id: number): void {
    this.#todoListsStore.removeList(id);
    const remaining = this.lists();
    if (this.activeListId() === id && remaining.length > 0) {
      this.activeListId.set(remaining[0].id);
    }
  }

  switchList(id: number): void {
    this.activeListId.set(id);
  }

  #focusTodoInput(listId: number): void {
    // Wait for the list card render before focusing the new-todo input.
    setTimeout(() => {
      const input = this.#document.getElementById(`new-todo-${listId}`);
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    });
  }
}
