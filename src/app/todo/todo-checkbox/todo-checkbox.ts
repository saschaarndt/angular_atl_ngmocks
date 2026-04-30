import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSquare, faSquareCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-todo-checkbox',
  imports: [FontAwesomeModule],
  templateUrl: './todo-checkbox.html',
  styleUrl: './todo-checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoCheckbox {
  readonly label = input('Aufgabe umschalten');
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly changed = output<boolean>();

  readonly uncheckedIcon = faSquare;
  readonly checkedIcon = faSquareCheck;

  onToggle(): void {
    if (this.disabled()) return;

    this.changed.emit(!this.checked());
  }
}
