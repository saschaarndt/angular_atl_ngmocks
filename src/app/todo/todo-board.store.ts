import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { TodoListModel } from './todo.model';

type TodoBoardState = {
  lists: TodoListModel[];
  nextListId: number;
};

const initialState: TodoBoardState = {
  lists: [
    { id: 1, name: 'Privat' },
    { id: 2, name: 'Büro' },
    { id: 3, name: 'Einkaufen' },
  ],
  nextListId: 4,
};

export const TodoBoardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addList(name: string): TodoListModel {
      const trimmed = name.trim();
      const list: TodoListModel = {
        id: store.nextListId(),
        name: trimmed,
      };

      patchState(store, {
        lists: [...store.lists(), list],
        nextListId: store.nextListId() + 1,
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
