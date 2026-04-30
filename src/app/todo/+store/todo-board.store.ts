import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { TodoListModel } from '../todo.model';

interface TodoBoardState {
  _nextListId: number;
  lists: TodoListModel[];
}

const initialState: TodoBoardState = {
  _nextListId: 4,
  lists: [
    { id: 1, name: 'Privat' },
    { id: 2, name: 'Büro' },
    { id: 3, name: 'Einkaufen' },
  ],
};

export const TodoBoardStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store) => ({
    addList(name: string): TodoListModel {
      const list: TodoListModel = {
        id: store._nextListId(),
        name: name.trim(),
      };

      patchState(store, {
        lists: [...store.lists(), list],
        _nextListId: store._nextListId() + 1,
      });

      return list;
    },

    removeList(id: number): void {
      patchState(store, {
        lists: store.lists().filter((list) => list.id !== id),
      });
    },
  })),
);
