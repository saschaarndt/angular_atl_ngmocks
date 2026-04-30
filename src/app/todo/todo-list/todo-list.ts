import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { TodoBoardStore } from '../+store/todo-board.store';
import { TodoCheckbox } from '../todo-checkbox/todo-checkbox';
import { TodoListStore } from '../+store/todo-list.store';
import { FilterType, Todo } from '../todo.model';
import { TodoTextInput } from '../todo-text-input/todo-text-input';

@Component({
  selector: 'app-todo-list',
  imports: [ReactiveFormsModule, FontAwesomeModule, TodoCheckbox, TodoTextInput],
  providers: [TodoListStore],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  readonly #todoListsStore = inject(TodoBoardStore);
  readonly #todoStore = inject(TodoListStore);
  readonly #todoControls = new Map<number, FormControl<boolean>>();
  readonly #todoControlSubscriptions = new Map<number, Subscription>();
  readonly #cdr = inject(ChangeDetectorRef);

  readonly newTodoInput = viewChild(TodoTextInput);

  readonly plusIcon = faPlus;
  readonly deleteIcon = faTrashCan;
  readonly clearIcon = faBroom;

  readonly listId = input.required<number>();

  readonly currentList = computed(() =>
    this.#todoListsStore.lists().find((l) => l.id === this.listId()),
  );

  readonly todos = computed(() =>
    this.#todoStore.todos().filter((t) => t.listId === this.listId()),
  );

  readonly activeTodos = computed(() => this.todos().filter((t) => !t.completed));
  readonly completedTodos = computed(() => this.todos().filter((t) => t.completed));

  readonly filter = signal<FilterType>('all');

  readonly filteredTodos = computed(() => {
    switch (this.filter()) {
      case 'active':
        return this.activeTodos();
      case 'completed':
        return this.completedTodos();
      default:
        return this.todos();
    }
  });

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  constructor() {
    effect(() => {
      this.listId();
      untracked(() => {
        this.filter.set('all');
        setTimeout(() => {
          this.newTodoInput()?.focus();
        });
      });
    });

    effect(() => {
      const todos = this.todos();
      const todoIds = new Set(todos.map((todo) => todo.id));

      for (const existingId of Array.from(this.#todoControls.keys())) {
        if (!todoIds.has(existingId)) {
          this.#todoControlSubscriptions.get(existingId)?.unsubscribe();
          this.#todoControlSubscriptions.delete(existingId);
          this.#todoControls.delete(existingId);
        }
      }

      for (const todo of todos) {
        const control = this.#getOrCreateTodoControl(todo);
        if (control.value !== todo.completed) {
          control.setValue(todo.completed, { emitEvent: false });
        }
      }
    });

    effect(() => {
      const listIds = new Set(this.#todoListsStore.lists().map((list) => list.id));
      const orphanListIds = Array.from(
        new Set(
          this.#todoStore
            .todos()
            .filter((todo) => !listIds.has(todo.listId))
            .map((todo) => todo.listId),
        ),
      );

      for (const listId of orphanListIds) {
        this.#todoStore.removeListTodos(listId);
      }
    });
  }

  addTodo(): void {
    const title = this.form.controls.title.value.trim();
    if (title) {
      this.#todoStore.add(this.listId(), title);
      this.form.reset({ title: '' });
      this.#cdr.markForCheck();
    }
  }

  remove(id: number): void {
    this.#todoStore.remove(id);
  }

  clearCompleted(): void {
    this.#todoStore.clearCompleted(this.listId());
  }

  setFilter(filter: FilterType): void {
    this.filter.set(filter);
  }

  todoControl(todo: Todo): FormControl<boolean> {
    return this.#getOrCreateTodoControl(todo);
  }

  #getOrCreateTodoControl(todo: Todo): FormControl<boolean> {
    const existing = this.#todoControls.get(todo.id);
    if (existing) {
      return existing;
    }

    const control = new FormControl(todo.completed, { nonNullable: true });
    const subscription = control.valueChanges.subscribe((checked) => {
      const currentTodo = this.#todoStore.todos().find((entry) => entry.id === todo.id);
      if (currentTodo && currentTodo.completed !== checked) {
        this.#todoStore.toggle(todo.id);
      }
    });

    this.#todoControls.set(todo.id, control);
    this.#todoControlSubscriptions.set(todo.id, subscription);
    return control;
  }
}
