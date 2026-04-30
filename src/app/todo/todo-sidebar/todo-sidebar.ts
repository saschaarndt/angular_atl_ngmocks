import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { TodoListModel } from '../todo.model';
import { TodoTextInput } from '../todo-text-input/todo-text-input';

@Component({
  selector: 'app-todo-sidebar',
  imports: [ReactiveFormsModule, FontAwesomeModule, TodoTextInput],
  templateUrl: './todo-sidebar.html',
  styleUrl: './todo-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoSidebar {
  readonly lists = input.required<TodoListModel[]>();
  readonly activeListId = input.required<number>();
  readonly form = input.required<FormGroup<{ name: FormControl<string> }>>();
  readonly plusIcon = input.required<IconDefinition>();
  readonly closeIcon = input.required<IconDefinition>();

  readonly listSelected = output<number>();
  readonly listRemoved = output<number>();
  readonly listAdded = output<void>();

  selectList(id: number): void {
    this.listSelected.emit(id);
  }

  removeList(id: number): void {
    this.listRemoved.emit(id);
  }

  addList(): void {
    this.listAdded.emit();
  }
}
