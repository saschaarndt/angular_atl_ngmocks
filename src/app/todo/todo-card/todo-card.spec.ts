import '../../../test-setup';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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

    const section = ngMocks.find('section').nativeElement as HTMLElement;
    const todoList = ngMocks.findInstance(TodoList);

    expect(section.getAttribute('aria-label')).toBe('Inbox');
    expect(ngMocks.find('app-todo-list')).toBeTruthy();
    expect(todoList.listId).toBe(5);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
