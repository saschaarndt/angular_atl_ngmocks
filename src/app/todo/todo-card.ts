import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TodoList } from './todo-list';

@Component({
  selector: 'app-todo-card',
  imports: [TodoList],
  templateUrl: './todo-card.html',
  styleUrl: './todo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoCard {
  readonly listId = input.required<number>();
  readonly listName = input<string | undefined>();
}
