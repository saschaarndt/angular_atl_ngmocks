import '../../../test-setup';
import { fireEvent, render, screen } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoBoard } from './todo-board';

describe('TodoBoard', () => {
  ngMocks.faster();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fügt gültige Listen hinzu und ignoriert leere Eingaben', async () => {
    const { fixture } = await render(TodoBoard);
    const component = fixture.componentInstance;

    const beforeLength = component.lists().length;
    component.form.controls.name.setValue('   ');
    component.addList();

    expect(component.lists()).toHaveLength(beforeLength);

    component.form.controls.name.setValue('Neue Liste');
    component.addList();
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists()).toHaveLength(beforeLength + 1);
    expect(component.activeListId()).toBe(4);
    expect(component.form.controls.name.value).toBe('');
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-4');
  });

  it('setzt Fokus und aktive Liste beim Entfernen korrekt', async () => {
    const { fixture } = await render(TodoBoard);
    const component = fixture.componentInstance;

    component.activeListId.set(2);
    fixture.detectChanges();
    fireEvent.click(screen.getByRole('button', { name: 'Liste löschen: Büro' }));
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(3);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-3');

    component.activeListId.set(1);
    fixture.detectChanges();
    fireEvent.click(screen.getByRole('button', { name: 'Liste löschen: Einkaufen' }));
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
  });

  it('wechselt die Liste und fokussiert das Eingabefeld', async () => {
    const { fixture } = await render(TodoBoard);
    const component = fixture.componentInstance;

    fireEvent.click(screen.getByRole('button', { name: 'Büro' }));
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(2);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-2');
  });

  it('verdrahtet Sidebar-Outputs im Template und ignoriert fehlende Fokusziele', async () => {
    const { fixture } = await render(TodoBoard);
    const component = fixture.componentInstance;

    fireEvent.click(screen.getByRole('button', { name: 'Büro' }));
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.activeListId()).toBe(2);

    component.form.controls.name.setValue('Per Output');
    fireEvent.click(screen.getByRole('button', { name: 'Liste hinzufügen' }));
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists().at(-1)?.name).toBe('Per Output');

    const addedId = component.activeListId();
    fireEvent.click(screen.getByRole('button', { name: 'Liste löschen: Per Output' }));
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists().some((list) => list.id === addedId)).toBe(false);

    component.switchList(999);
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.activeListId()).toBe(999);
    expect(fixture.nativeElement.querySelector('app-todo-card')).toBeNull();
  });
});
