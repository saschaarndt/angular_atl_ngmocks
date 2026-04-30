import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { TodoCardHarness } from './todo-card.harness';
import { TodoCard } from './todo-card';
import { TodoList } from '../todo-list/todo-list';

describe('TodoCard', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TodoCard).mock(TodoList));

  it('rendert das Listen-Label und reicht die listId weiter', () => {
    const fixture = MockRender(TodoCard, {
      listId: 5,
      listName: 'Inbox',
    });
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const todoList = ngMocks.findInstance(TodoList);
    return loader.getHarness(TodoCardHarness).then(async (harness) => {
      await expect(harness.getListName()).resolves.toBe('Inbox');
      expect(await harness.getTodoListHarness()).toBeTruthy();
      expect(ngMocks.find('app-todo-list')).toBeTruthy();
      expect(todoList.listId).toBe(5);
      expect(fixture.point.componentInstance).toBeTruthy();
    });
  });
});
