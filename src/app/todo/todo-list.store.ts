import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { Todo } from './todo.model';

type TodoListState = {
  todos: Todo[];
  nextTodoId: number;
};

const initialState: TodoListState = {
  todos: [],
  nextTodoId: 1,
};

export const TodoListStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    add(listId: number, title: string): void {
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }

      patchState(store, (state) => ({
        todos: [...state.todos, { id: state.nextTodoId, title: trimmed, completed: false, listId }],
        nextTodoId: state.nextTodoId + 1,
      }));
    },

    toggle(id: number): void {
      patchState(store, (state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      }));
    },

    remove(id: number): void {
      patchState(store, (state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      }));
    },

    clearCompleted(listId: number): void {
      patchState(store, (state) => ({
        todos: state.todos.filter((todo) => !(todo.listId === listId && todo.completed)),
      }));
    },

    removeListTodos(listId: number): void {
      patchState(store, (state) => ({
        todos: state.todos.filter((todo) => todo.listId !== listId),
      }));
    },
  })),
);
