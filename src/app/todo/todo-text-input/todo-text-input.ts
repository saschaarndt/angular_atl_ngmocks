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
  readonly #cdr = inject(ChangeDetectorRef);

  readonly textInput = viewChild.required<ElementRef<HTMLInputElement>>('textInput');

  readonly label = input('Eingabe');
  readonly id = input('todo-text-input');
  readonly placeholder = input(' ');
  readonly autocomplete = input('off');
  readonly isKeyboardFocused = signal(false);

  value = '';
  disabled = false;

  #mouseDownPending = false;
  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
    this.#cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.#cdr.markForCheck();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.#onChange(this.value);
  }

  onMouseDown(): void {
    this.#mouseDownPending = true;
  }

  onFocus(): void {
    this.isKeyboardFocused.set(!this.#mouseDownPending);
    this.#mouseDownPending = false;
  }

  onBlur(): void {
    this.isKeyboardFocused.set(false);
    this.#mouseDownPending = false;
    this.#onTouched();
  }

  focus(): void {
    this.textInput().nativeElement.focus();
  }
}
