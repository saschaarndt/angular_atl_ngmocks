import { TestBed } from '@angular/core/testing';

import { TodoBoardStore } from '../+store/todo-board.store';
import { TodoListStore } from '../+store/todo-list.store';
import { TodoTextInput } from '../todo-text-input/todo-text-input';
import { TodoList } from './todo-list';

describe('TodoList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function createComponent(listId = 1) {
    await TestBed.configureTestingModule({
      imports: [TodoList],
    }).compileComponents();

    const focusSpy = vi.spyOn(TodoTextInput.prototype, 'focus').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(TodoList);
    fixture.componentRef.setInput('listId', listId);
    fixture.detectChanges();
    vi.runAllTimers();
    fixture.detectChanges();

    return {
      fixture,
      component: fixture.componentInstance,
      boardStore: TestBed.inject(TodoBoardStore),
      todoStore: fixture.debugElement.injector.get(TodoListStore),
      focusSpy,
    };
  }

  it('fokussiert beim Listenwechsel neu und entfernt verwaiste Todos', async () => {
    const { fixture, component, todoStore, focusSpy } = await createComponent(1);

    expect(component.filter()).toBe('all');
    expect(component.currentList()?.name).toBe('Privat');
    expect(component.newTodoInput()).toBeTruthy();
    expect(focusSpy).toHaveBeenCalled();

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

    component.form.controls.title.setValue('   ');
    component.addTodo();
    expect(todoStore.todos()).toHaveLength(0);

    component.form.controls.title.setValue('Aufgabe 1');
    component.addTodo();
    expect(todoStore.todos()).toHaveLength(1);
    expect(todoStore.todos()[0].title).toBe('Aufgabe 1');
    expect(component.form.controls.title.value).toBe('');
    expect(focusSpy).toHaveBeenCalledTimes(2);

    todoStore.add(1, 'Aufgabe 2');
    todoStore.toggle(2);
    fixture.detectChanges();

    component.setFilter('active');
    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([1]);

    component.setFilter('completed');
    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([2]);

    component.setFilter('all');
    expect(component.filteredTodos()).toHaveLength(2);

    const toggleSpy = vi.spyOn(todoStore, 'toggle');
    component.onTodoCheckedChange(todoStore.todos()[0], true);
    component.onTodoCheckedChange(todoStore.todos()[1], true);
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenCalledWith(1);

    component.remove(1);
    expect(todoStore.todos().map((todo) => todo.id)).toEqual([2]);

    component.clearCompleted();
    expect(todoStore.todos()).toEqual([]);
  });

  it('verdrahtet die Template-Interaktionen über DOM-Events', async () => {
    const { fixture, component, todoStore } = await createComponent(1);

    const input = fixture.nativeElement.querySelector('#new-todo-1') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    input.value = 'Aufgabe 1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    todoStore.add(1, 'Aufgabe 2');
    todoStore.toggle(2);
    fixture.detectChanges();

    expect(component.todos()).toHaveLength(2);
    expect(component.activeTodos()).toHaveLength(1);
    expect(component.completedTodos()).toHaveLength(1);

    const filterButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.todo-list__filter-button'),
    ) as HTMLButtonElement[];

    filterButtons[2].click();
    fixture.detectChanges();
    expect(component.filter()).toBe('completed');

    const deleteButton = fixture.nativeElement.querySelector(
      '.todo-list__delete-button',
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();
    expect(todoStore.todos().map((todo) => todo.id)).toEqual([1]);

    filterButtons[0].click();
    fixture.detectChanges();
    expect(component.filter()).toBe('all');

    const checkboxButton = fixture.nativeElement.querySelector(
      'button.todo-checkbox',
    ) as HTMLButtonElement;
    checkboxButton.click();
    fixture.detectChanges();
    expect(todoStore.todos()[0].completed).toBe(true);

    filterButtons[1].click();
    fixture.detectChanges();
    expect(component.filter()).toBe('active');
    expect(fixture.nativeElement.querySelector('.todo-list__empty')?.textContent).toContain(
      'Keine Aufgaben in dieser Ansicht.',
    );

    filterButtons[2].click();
    fixture.detectChanges();
    expect(component.filter()).toBe('completed');

    const clearButton = fixture.nativeElement.querySelector(
      '.todo-list__clear-button',
    ) as HTMLButtonElement;
    clearButton.click();
    fixture.detectChanges();
    expect(todoStore.todos()).toEqual([]);
  });
});
