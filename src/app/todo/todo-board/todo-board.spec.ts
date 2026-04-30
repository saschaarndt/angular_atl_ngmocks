import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TodoBoard } from './todo-board';
import { TodoBoardStore } from '../+store/todo-board.store';
import { TodoSidebar } from '../todo-sidebar/todo-sidebar';

describe('TodoBoard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fügt gültige Listen hinzu und ignoriert leere Eingaben', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoBoard],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoBoard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

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
    await TestBed.configureTestingModule({
      imports: [TodoBoard],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoBoard);
    const component = fixture.componentInstance;
    const store = TestBed.inject(TodoBoardStore);

    fixture.detectChanges();

    component.activeListId.set(2);
    fixture.detectChanges();
    component.removeList(2);
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(3);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-3');

    component.activeListId.set(1);
    fixture.detectChanges();
    component.removeList(3);
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(1);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('todo-list-button-1');

    store.removeList(2);
    fixture.detectChanges();
    const newListInput = fixture.nativeElement.querySelector('#new-list') as HTMLInputElement;
    const newListFocusSpy = vi.spyOn(newListInput, 'focus');
    component.removeList(1);
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(0);
    expect(newListFocusSpy).toHaveBeenCalled();
  });

  it('wechselt die Liste und fokussiert das Eingabefeld', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoBoard],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoBoard);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    component.switchList(2);
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.activeListId()).toBe(2);
    expect((document.activeElement as HTMLElement | null)?.id).toBe('new-todo-2');
  });

  it('verdrahtet Sidebar-Outputs im Template und ignoriert fehlende Fokusziele', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoBoard],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoBoard);
    const component = fixture.componentInstance;
    const sidebar = fixture.debugElement.query(By.directive(TodoSidebar))
      .componentInstance as TodoSidebar;

    fixture.detectChanges();

    sidebar.listSelected.emit(2);
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.activeListId()).toBe(2);

    component.form.controls.name.setValue('Per Output');
    sidebar.listAdded.emit();
    fixture.detectChanges();
    vi.runAllTimers();

    expect(component.lists().at(-1)?.name).toBe('Per Output');

    const addedId = component.activeListId();
    sidebar.listRemoved.emit(addedId);
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
