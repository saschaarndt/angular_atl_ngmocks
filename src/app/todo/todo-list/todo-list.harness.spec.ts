import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { render } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoListStore } from '../+store/todo-list.store';
import { TodoTextInput } from '../todo-text-input/todo-text-input';
import { TodoListHarness } from './todo-list.harness';
import { TodoList } from './todo-list';

describe('TodoListHarness', () => {
  ngMocks.faster();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stellt die Listeninteraktionen ueber die Harness-API bereit', async () => {
    const focusSpy = vi.spyOn(TodoTextInput.prototype, 'focus').mockImplementation(() => undefined);
    const { fixture } = await render(TodoList, {
      inputs: {
        listId: 1,
      },
    });
    const todoStore = fixture.debugElement.injector.get(TodoListStore);

    fixture.detectChanges();
    vi.runAllTimers();
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoListHarness);

    await expect(harness.getInputHarness()).resolves.toBeTruthy();
    await expect(harness.getActiveFilter()).resolves.toBeNull();
    await expect(harness.getOpenCountText()).resolves.toBeNull();

    await harness.addTodo('Alpha');
    await harness.addTodo('Beta');
    expect(todoStore.todos().map((todo) => todo.title)).toEqual(['Alpha', 'Beta']);
    expect(focusSpy).toHaveBeenCalled();
    await expect(harness.getCurrentTodoTitles()).resolves.toEqual(['Alpha', 'Beta']);
    await expect(harness.getOpenCountText()).resolves.toContain('2 Aufgaben offen');

    await harness.removeTodo('Alpha');
    expect(todoStore.todos().map((todo) => todo.title)).toEqual(['Beta']);

    await harness.toggleTodo('Beta');
    expect(todoStore.todos().find((todo) => todo.title === 'Beta')?.completed).toBe(true);

    await harness.setFilter('active');
    await expect(harness.getActiveFilter()).resolves.toBe('active');
    await expect(harness.hasEmptyState()).resolves.toBe(true);

    await harness.setFilter('completed');
    await expect(harness.getActiveFilter()).resolves.toBe('completed');
    await expect(harness.getCurrentTodoTitles()).resolves.toEqual(['Beta']);

    await harness.clearCompleted();
    expect(todoStore.todos()).toEqual([]);
    await expect(harness.hasEmptyState()).resolves.toBe(false);
    await expect(harness.getOpenCountText()).resolves.toBeNull();
  });
});
