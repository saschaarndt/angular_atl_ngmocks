import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSquare, faSquareCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-todo-checkbox',
  imports: [FontAwesomeModule],
  templateUrl: './todo-checkbox.html',
  styleUrl: './todo-checkbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TodoCheckbox),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoCheckbox implements ControlValueAccessor {
  readonly label = input('Aufgabe umschalten');

  readonly uncheckedIcon = faSquare;
  readonly checkedIcon = faSquareCheck;

  checked = false;
  disabled = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggle(): void {
    if (this.disabled) {
      return;
    }
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
  }
}
