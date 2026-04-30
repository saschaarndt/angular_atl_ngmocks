import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
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
  readonly #document = inject(DOCUMENT);

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

  onTabKeydown(event: KeyboardEvent, id: number): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.#focusRelativeTab(id, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.#focusRelativeTab(id, -1);
        break;
      case 'Home':
        event.preventDefault();
        this.#focusEdgeTab('first');
        break;
      case 'End':
        event.preventDefault();
        this.#focusEdgeTab('last');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectList(id);
        break;
    }
  }

  removeList(id: number): void {
    this.listRemoved.emit(id);
  }

  addList(): void {
    this.listAdded.emit();
  }

  tabId(id: number): string {
    return `todo-tab-${id}`;
  }

  panelId(id: number): string {
    return `todo-panel-${id}`;
  }

  #focusRelativeTab(id: number, step: number): void {
    const lists = this.lists();
    const currentIndex = lists.findIndex((list) => list.id === id);

    if (currentIndex === -1 || lists.length === 0) {
      return;
    }

    const nextIndex = (currentIndex + step + lists.length) % lists.length;
    this.#focusTab(lists[nextIndex].id);
  }

  #focusEdgeTab(edge: 'first' | 'last'): void {
    const lists = this.lists();
    const target = edge === 'first' ? lists[0] : lists[lists.length - 1];

    if (target) {
      this.#focusTab(target.id);
    }
  }

  #focusTab(id: number): void {
    const tab = this.#document.getElementById(this.tabId(id));

    if (tab instanceof HTMLButtonElement) {
      tab.focus();
    }
  }
}
