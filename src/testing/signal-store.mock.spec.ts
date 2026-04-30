import '../test-setup';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ngMocks } from 'ng-mocks';

import { TodoBoardStore } from '../app/todo/+store/todo-board.store';
import { TodoListStore } from '../app/todo/+store/todo-list.store';
import { createSignalStoreMock, provideMockSignalStore } from './signal-store.mock';

describe('signal store mock helper', () => {
  ngMocks.faster();

  it('erlaubt auch einen komplett leeren Mock ohne Konfiguration', () => {
    const storeMock = createSignalStoreMock<typeof TodoBoardStore>();

    expect(storeMock).toEqual({});
  });

  it('erstellt typisierte Signal- und Methoden-Mocks fuer Signal-Stores', () => {
    const todos = signal([{ id: 1, title: 'Mock Todo', completed: false, listId: 1 }]);
    const storeMock = createSignalStoreMock<typeof TodoListStore>({
      state: {
        todos,
      },
      methods: ['add', 'toggle', 'remove', 'clearCompleted', 'removeListTodos'],
    });

    expect(storeMock.todos()).toEqual([{ id: 1, title: 'Mock Todo', completed: false, listId: 1 }]);

    storeMock.todos.set([{ id: 2, title: 'Neu', completed: true, listId: 3 }]);

    expect(storeMock.todos()).toEqual([{ id: 2, title: 'Neu', completed: true, listId: 3 }]);

    storeMock.add(3, 'Aufgabe');
    storeMock.toggle(2);
    storeMock.remove(2);
    storeMock.clearCompleted(3);
    storeMock.removeListTodos(3);

    expect(storeMock.add).toHaveBeenCalledWith(3, 'Aufgabe');
    expect(storeMock.toggle).toHaveBeenCalledWith(2);
    expect(storeMock.remove).toHaveBeenCalledWith(2);
    expect(storeMock.clearCompleted).toHaveBeenCalledWith(3);
    expect(storeMock.removeListTodos).toHaveBeenCalledWith(3);
  });

  it('unterstuetzt Methoden-Implementierungen und Provider fuer andere Stores', () => {
    TestBed.configureTestingModule({
      providers: [
        provideMockSignalStore(TodoBoardStore, {
          state: {
            lists: [{ id: 1, name: 'Privat' }],
          },
          methods: ['addList', 'removeList'],
          methodImpls: {
            addList: (name) => ({ id: 99, name: name.trim() }),
          },
        }),
      ],
    });

    const storeMock = TestBed.inject(TodoBoardStore);
    const created = storeMock.addList('  Reisen  ');

    expect(storeMock.lists()).toEqual([{ id: 1, name: 'Privat' }]);
    expect(created).toEqual({ id: 99, name: 'Reisen' });
    expect(storeMock.addList).toHaveBeenCalledWith('  Reisen  ');

    storeMock.removeList(1);

    expect(storeMock.removeList).toHaveBeenCalledWith(1);
  });
});
