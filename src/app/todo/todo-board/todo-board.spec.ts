import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoBoardHarness } from './todo-board.harness';
import { TodoBoard } from './todo-board';
import { TodoBoardStore } from '../+store/todo-board.store';
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

describe('TodoBoard', () => {
  ngMocks.faster();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function createComponent() {
    const { fixture } = await render(TodoBoard, {
      providers: [createTodoBoardStoreProvider()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      boardStore: fixture.debugElement.injector.get(TodoBoardStore) as SignalStoreMock<
        typeof TodoBoardStore
      >,
    };
  }

  it('fügt gültige Listen hinzu und ignoriert leere Eingaben', async () => {
    const { fixture, component, boardStore } = await createComponent();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoBoardHarness);

    const beforeLength = component.lists().length;
    await harness.addList('   ');

    expect(component.lists()).toHaveLength(beforeLength);
    expect(boardStore.addList).not.toHaveBeenCalled();

    await expect(harness.getTitle()).resolves.toContain('Meine Aufgaben');
    await expect(harness.getClaim()).resolves.toContain('Damit ich es nicht im Kopf haben muss.');
    await expect(harness.hasCard()).resolves.toBe(true);

    await harness.addList('Neue Liste');
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists()).toHaveLength(beforeLength + 1);
    expect(component.activeListId()).toBe(4);
    expect(component.form.controls.name.value).toBe('');
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-4');
    expect(await harness.getCardHarness()).toBeTruthy();
    expect(boardStore.addList).toHaveBeenCalledWith('Neue Liste');
  });

  it('setzt Fokus und aktive Liste beim Entfernen korrekt', async () => {
    const { fixture, component, boardStore } = await createComponent();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoBoardHarness);
    const sidebarHarness = await harness.getSidebarHarness();

    component.activeListId.set(2);
    fixture.detectChanges();
    await expect(sidebarHarness.getActiveListName()).resolves.toBe('Büro');
    await harness.removeList('Büro');
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(3);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-3');

    component.activeListId.set(1);
    fixture.detectChanges();
    await harness.removeList('Einkaufen');
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(1);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('todo-list-button-1');

    const newListElement = fixture.nativeElement.querySelector('#new-list') as HTMLElement;
    const newListFocusSpy = vi.spyOn(newListElement, 'focus');
    component.removeList(1);
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(0);
    expect(newListFocusSpy).toHaveBeenCalled();
    expect(boardStore.removeList).toHaveBeenCalledWith(2);
    expect(boardStore.removeList).toHaveBeenCalledWith(3);
    expect(boardStore.removeList).toHaveBeenCalledWith(1);
  });

  it('wechselt die Liste und fokussiert das Eingabefeld', async () => {
    const { fixture, component } = await createComponent();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoBoardHarness);

    await harness.selectList('Büro');
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(2);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-2');
  });

  it('verdrahtet Sidebar-Outputs im Template und ignoriert fehlende Fokusziele', async () => {
    const { fixture, component, boardStore } = await createComponent();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoBoardHarness);

    await harness.selectList('Büro');
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.activeListId()).toBe(2);

    await harness.addList('Per Output');
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists().at(-1)?.name).toBe('Per Output');

    const addedId = component.activeListId();
    await harness.removeList('Per Output');
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists().some((list) => list.id === addedId)).toBe(false);

    component.switchList(999);
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.activeListId()).toBe(999);
    expect(fixture.nativeElement.querySelector('app-todo-card')).toBeNull();
    expect(boardStore.addList).toHaveBeenCalledWith('Per Output');
    expect(boardStore.removeList).toHaveBeenCalledWith(4);
  });
});
