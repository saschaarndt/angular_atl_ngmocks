import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { signal } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoListHarness } from './todo-list.harness';
import { TodoBoardStore } from '../+store/todo-board.store';
import { TodoListStore } from '../+store/todo-list.store';
import { TodoTextInput } from '../todo-text-input/todo-text-input';
import { TodoList } from './todo-list';
import { provideMockSignalStore, type SignalStoreMock } from '../../../testing/signal-store.mock';

const defaultLists = [
  { id: 1, name: 'Privat' },
  { id: 2, name: 'Büro' },
  { id: 3, name: 'Einkaufen' },
];

function createTodoBoardStoreProvider() {
  const lists = signal([...defaultLists]);
  let nextListId = 4;

  return provideMockSignalStore(TodoBoardStore, {
    state: { lists },
    methods: ['addList', 'removeList'],
    methodImpls: {
      addList: (name) => {
        const created = { id: nextListId, name: name.trim() };
        nextListId += 1;
        lists.update((current) => [...current, created]);
        return created;
      },
      removeList: (id) => {
        lists.update((current) => current.filter((list) => list.id !== id));
      },
    },
  });
}

function createTodoListStoreProvider() {
  const todos = signal<{ id: number; title: string; completed: boolean; listId: number }[]>([]);
  let nextTodoId = 1;

  return provideMockSignalStore(TodoListStore, {
    state: { todos },
    methods: ['add', 'toggle', 'remove', 'clearCompleted', 'removeListTodos'],
    methodImpls: {
      add: (listId, title) => {
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }

        todos.update((current) => [
          ...current,
          { id: nextTodoId++, title: trimmed, completed: false, listId },
        ]);
      },
      toggle: (id) => {
        todos.update((current) =>
          current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
        );
      },
      remove: (id) => {
        todos.update((current) => current.filter((todo) => todo.id !== id));
      },
      clearCompleted: (listId) => {
        todos.update((current) =>
          current.filter((todo) => !(todo.listId === listId && todo.completed)),
        );
      },
      removeListTodos: (listId) => {
        todos.update((current) => current.filter((todo) => todo.listId !== listId));
      },
    },
  });
}

describe('TodoList', () => {
  ngMocks.faster();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function createComponent(listId = 1) {
    const focusSpy = vi.spyOn(TodoTextInput.prototype, 'focus').mockImplementation(() => undefined);
    const { fixture } = await render(TodoList, {
      inputs: {
        listId,
      },
      providers: [createTodoBoardStoreProvider()],
      componentProviders: [createTodoListStoreProvider()],
    });

    fixture.detectChanges();
    vi.runAllTimers();
    fixture.detectChanges();

    return {
      fixture,
      component: fixture.componentInstance,
      boardStore: fixture.debugElement.injector.get(TodoBoardStore) as SignalStoreMock<
        typeof TodoBoardStore
      >,
      todoStore: fixture.debugElement.injector.get(TodoListStore) as SignalStoreMock<
        typeof TodoListStore
      >,
      focusSpy,
    };
  }

  it('fokussiert beim Listenwechsel neu und entfernt verwaiste Todos', async () => {
    const { fixture, component, todoStore, focusSpy } = await createComponent(1);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoListHarness);

    expect(component.filter()).toBe('all');
    await expect(harness.getActiveFilter()).resolves.toBeNull();
    await expect(harness.setFilter('all')).rejects.toThrow('Filter button not found: all');
    await expect(harness.getOpenCountText()).resolves.toBeNull();
    await expect(harness.clearCompleted()).resolves.toBeUndefined();
    expect(component.currentList()?.name).toBe('Privat');
    expect(component.newTodoInput()).toBeTruthy();
    expect(focusSpy).toHaveBeenCalled();
    await expect(harness.getInputHarness()).resolves.toBeTruthy();

    todoStore.add(999, 'Verwaist');
    fixture.detectChanges();

    expect(todoStore.todos().some((todo) => todo.listId === 999)).toBe(false);

    component.setFilter('completed');
    fixture.componentRef.setInput('listId', 2);
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.filter()).toBe('all');
    expect(focusSpy).toHaveBeenCalledTimes(2);
  });

  it('fügt Todos hinzu, filtert, toggelt und entfernt sie', async () => {
    const { fixture, component, todoStore, focusSpy } = await createComponent(1);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoListHarness);

    component.form.controls.title.setValue('   ');
    component.addTodo();
    expect(todoStore.todos()).toHaveLength(0);

    await harness.addTodo('Aufgabe 1');
    expect(todoStore.todos()).toHaveLength(1);
    expect(todoStore.todos()[0].title).toBe('Aufgabe 1');
    expect(component.form.controls.title.value).toBe('');
    expect(focusSpy).toHaveBeenCalledTimes(2);
    await expect(harness.hasEmptyState()).resolves.toBe(false);

    todoStore.add(1, 'Aufgabe 2');
    todoStore.toggle(2);
    fixture.detectChanges();

    await harness.setFilter('active');
    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([1]);
    await expect(harness.getActiveFilter()).resolves.toBe('active');

    await harness.setFilter('completed');
    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([2]);
    await expect(harness.getActiveFilter()).resolves.toBe('completed');

    await harness.setFilter('all');
    expect(component.filteredTodos()).toHaveLength(2);
    await expect(harness.getActiveFilter()).resolves.toBe('all');
    await expect(harness.getCurrentTodoTitles()).resolves.toEqual(['Aufgabe 1', 'Aufgabe 2']);
    await expect(harness.getOpenCountText()).resolves.toContain('1 Aufgabe offen');

    todoStore.toggle.mockClear();
    component.onTodoCheckedChange(todoStore.todos()[0], true);
    component.onTodoCheckedChange(todoStore.todos()[1], true);
    expect(todoStore.toggle).toHaveBeenCalledTimes(1);
    expect(todoStore.toggle).toHaveBeenCalledWith(1);

    await harness.removeTodo('Aufgabe 1');
    expect(todoStore.todos().map((todo) => todo.id)).toEqual([2]);

    await harness.clearCompleted();
    expect(todoStore.todos()).toEqual([]);
  });

  it('verdrahtet die Template-Interaktionen über DOM-Events', async () => {
    const { fixture, component, todoStore } = await createComponent(1);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoListHarness);

    const input = screen.getByLabelText('Neue Aufgabe') as HTMLInputElement;
    const form = input.closest('form') as HTMLFormElement;

    fireEvent.input(input, { target: { value: 'Aufgabe 1' } });
    fixture.detectChanges();
    fireEvent.submit(form);
    fixture.detectChanges();

    todoStore.add(1, 'Aufgabe 2');
    todoStore.toggle(2);
    fixture.detectChanges();

    expect(component.todos()).toHaveLength(2);
    expect(component.activeTodos()).toHaveLength(1);
    expect(component.completedTodos()).toHaveLength(1);
    await expect(harness.getCurrentTodoTitles()).resolves.toEqual(['Aufgabe 1', 'Aufgabe 2']);

    await harness.setFilter('completed');
    expect(component.filter()).toBe('completed');

    await harness.removeTodo('Aufgabe 2');
    expect(todoStore.todos().map((todo) => todo.id)).toEqual([1]);

    await harness.setFilter('all');
    expect(component.filter()).toBe('all');

    await harness.toggleTodo('Aufgabe 1');
    expect(todoStore.todos()[0].completed).toBe(true);

    await harness.setFilter('active');
    expect(component.filter()).toBe('active');
    await expect(harness.hasEmptyState()).resolves.toBe(true);
    expect(screen.getByText('Keine Aufgaben in dieser Ansicht.')).toBeTruthy();

    await harness.setFilter('completed');
    expect(component.filter()).toBe('completed');

    const activeFilterButton = fixture.nativeElement.querySelector(
      '.todo-list__filter-button--active',
    ) as HTMLButtonElement;
    activeFilterButton.textContent = 'Unbekannt';
    await expect(harness.getActiveFilter()).resolves.toBeNull();

    await harness.clearCompleted();
    expect(todoStore.todos()).toEqual([]);
  });
});
