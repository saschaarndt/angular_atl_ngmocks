import { fireEvent, render, screen } from '@testing-library/angular';

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
    const focusSpy = vi.spyOn(TodoTextInput.prototype, 'focus').mockImplementation(() => undefined);
    const { fixture } = await render(TodoList, {
      inputs: {
        listId,
      },
    });

    fixture.detectChanges();
    vi.runAllTimers();
    fixture.detectChanges();

    return {
      fixture,
      component: fixture.componentInstance,
      boardStore: fixture.debugElement.injector.get(TodoBoardStore),
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

    const filterButtons = [
      screen.getByRole('button', { name: 'Alle' }),
      screen.getByRole('button', { name: 'Aktiv' }),
      screen.getByRole('button', { name: 'Erledigt' }),
    ];

    fireEvent.click(filterButtons[2]);
    fixture.detectChanges();
    expect(component.filter()).toBe('completed');

    const deleteButton = screen.getByRole('button', { name: 'Aufgabe löschen: Aufgabe 2' });
    fireEvent.click(deleteButton);
    fixture.detectChanges();
    expect(todoStore.todos().map((todo) => todo.id)).toEqual([1]);

    fireEvent.click(filterButtons[0]);
    fixture.detectChanges();
    expect(component.filter()).toBe('all');

    const checkboxButton = screen.getByRole('checkbox', {
      name: 'Aufgabe als erledigt markieren: Aufgabe 1',
    });
    fireEvent.click(checkboxButton);
    fixture.detectChanges();
    expect(todoStore.todos()[0].completed).toBe(true);

    fireEvent.click(filterButtons[1]);
    fixture.detectChanges();
    expect(component.filter()).toBe('active');
    expect(screen.getByText('Keine Aufgaben in dieser Ansicht.')).toBeTruthy();

    fireEvent.click(filterButtons[2]);
    fixture.detectChanges();
    expect(component.filter()).toBe('completed');

    const clearButton = screen.getByRole('button', { name: 'Erledigte löschen' });
    fireEvent.click(clearButton);
    fixture.detectChanges();
    expect(todoStore.todos()).toEqual([]);
  });
});
