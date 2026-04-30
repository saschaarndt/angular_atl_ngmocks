import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { Todo } from '../todo.model';

type TodoListState = {
  _nextTodoId: number;
  todos: Todo[];
};

const initialState: TodoListState = {
  _nextTodoId: 1,
  todos: [],
};

export const TodoListStore = signalStore(
  withState(initialState),

  withMethods((store) => ({
    add(listId: number, title: string): void {
      const trimmed = title.trim();
      if (!trimmed) return;

      patchState(store, (state) => ({
        todos: [
          ...state.todos,
          { id: state._nextTodoId, title: trimmed, completed: false, listId },
        ],
        _nextTodoId: state._nextTodoId + 1,
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
