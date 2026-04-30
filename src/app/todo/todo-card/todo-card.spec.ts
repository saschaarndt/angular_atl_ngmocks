import { render, screen } from '@testing-library/angular';

import { TodoCard } from './todo-card';

describe('TodoCard', () => {
  it('rendert das Listen-Label und reicht die listId weiter', async () => {
    const { fixture } = await render(TodoCard, {
      inputs: {
        listId: 5,
        listName: 'Inbox',
      },
    });

    const section = screen.getByLabelText('Inbox') as HTMLElement;
    const input = screen.getByLabelText('Neue Aufgabe') as HTMLInputElement;

    expect(section.tagName).toBe('SECTION');
    expect(section.getAttribute('aria-label')).toBe('Inbox');
    expect(input.id).toBe('new-todo-5');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
