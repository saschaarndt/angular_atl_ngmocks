import '../../../test-setup';
import { ngMocks } from 'ng-mocks';
import { TestBed } from '@angular/core/testing';

import { TodoListStore } from './todo-list.store';

describe('TodoListStore', () => {
  ngMocks.faster();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoListStore],
    });
  });

  it('deckt alle Store-Operationen ab', () => {
    const store = TestBed.inject(TodoListStore);

    store.add(1, '  Aufgabe 1  ');
    store.add(2, 'Aufgabe 2');
    store.add(1, '   ');

    expect(store.todos()).toEqual([
      { id: 1, title: 'Aufgabe 1', completed: false, listId: 1 },
      { id: 2, title: 'Aufgabe 2', completed: false, listId: 2 },
    ]);

    store.toggle(1);
    expect(store.todos()[0].completed).toBe(true);

    store.clearCompleted(1);
    expect(store.todos()).toEqual([{ id: 2, title: 'Aufgabe 2', completed: false, listId: 2 }]);

    store.add(3, 'Aufgabe 3');
    store.remove(2);
    expect(store.todos()).toEqual([{ id: 3, title: 'Aufgabe 3', completed: false, listId: 3 }]);

    store.removeListTodos(3);
    expect(store.todos()).toEqual([]);
  });
});
