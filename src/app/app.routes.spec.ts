import '../test-setup';
import { ngMocks } from 'ng-mocks';
import { routes } from './app.routes';
import { TodoBoard } from './todo/todo-board/todo-board';

describe('routes', () => {
  ngMocks.faster();

  it('lädt das TodoBoard auf der Root-Route lazy', async () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    await expect(routes[0].loadComponent?.()).resolves.toBe(TodoBoard);
  });
});
