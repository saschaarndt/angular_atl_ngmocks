import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TodoCard } from './todo-card';
import { TodoList } from '../todo-list/todo-list';

describe('TodoCard', () => {
  it('rendert das Listen-Label und reicht die listId weiter', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoCard],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoCard);
    fixture.componentRef.setInput('listId', 5);
    fixture.componentRef.setInput('listName', 'Inbox');
    fixture.detectChanges();

    const todoListDebugElement = fixture.debugElement.query(By.directive(TodoList));
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;

    expect(section.getAttribute('aria-label')).toBe('Inbox');
    expect(todoListDebugElement.componentInstance.listId()).toBe(5);
  });
});
