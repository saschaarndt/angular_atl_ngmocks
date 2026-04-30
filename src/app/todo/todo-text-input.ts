import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-todo-text-input',
  templateUrl: './todo-text-input.html',
  styleUrl: './todo-text-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TodoTextInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoTextInput implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly textInput = viewChild.required<ElementRef<HTMLInputElement>>('textInput');

  readonly label = input('Eingabe');
  readonly id = input('todo-text-input');
  readonly placeholder = input(' ');
  readonly autocomplete = input('off');

  value = '';
  disabled = false;
  readonly isKeyboardFocused = signal(false);

  private _mouseDownPending = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onMouseDown(): void {
    this._mouseDownPending = true;
  }

  onFocus(): void {
    if (this._mouseDownPending) {
      this.isKeyboardFocused.set(false);
    } else {
      this.isKeyboardFocused.set(true);
    }
    this._mouseDownPending = false;
  }

  onBlur(): void {
    this.isKeyboardFocused.set(false);
    this._mouseDownPending = false;
    this.onTouched();
  }

  focus(): void {
    this.textInput().nativeElement.focus();
  }
}
