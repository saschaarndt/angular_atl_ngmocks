import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { TodoCardHarness } from './todo-card.harness';
import { TodoCard } from './todo-card';
import { TodoList } from '../todo-list/todo-list';

describe('TodoCardHarness', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TodoCard).mock(TodoList));

  it('liest das Kartenlabel und liefert die verschachtelte Listen-Harness', async () => {
    const fixture = MockRender(TodoCard, {
      listId: 7,
      listName: 'Inbox',
    });
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const harness = await loader.getHarness(TodoCardHarness);

    await expect(harness.getListName()).resolves.toBe('Inbox');
    await expect(harness.getTodoListHarness()).resolves.toBeTruthy();
    expect(ngMocks.find('app-todo-list')).toBeTruthy();
  });
});
