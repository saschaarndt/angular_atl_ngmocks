import '../../../test-setup';
import { ngMocks } from 'ng-mocks';
import { TestBed } from '@angular/core/testing';

import { TodoBoardStore } from './todo-board.store';

describe('TodoBoardStore', () => {
  ngMocks.faster();

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('fügt getrimmte Listen hinzu und entfernt Listen', () => {
    const store = TestBed.inject(TodoBoardStore);

    expect(store.lists()).toHaveLength(3);

    const created = store.addList('  Reisen  ');

    expect(created).toEqual({ id: 4, name: 'Reisen' });
    expect(store.lists().at(-1)).toEqual(created);

    store.removeList(2);

    expect(store.lists().map((list) => list.id)).toEqual([1, 3, 4]);
  });
});
