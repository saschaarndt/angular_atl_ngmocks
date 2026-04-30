import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { TodoTextInput } from './todo-text-input';

describe('TodoTextInput', () => {
  it('bindet Werte und Attribute korrekt', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoTextInput],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoTextInput);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Titel');
    fixture.componentRef.setInput('id', 'todo-input');
    fixture.componentRef.setInput('placeholder', 'Text');
    fixture.componentRef.setInput('autocomplete', 'name');
    fixture.detectChanges();

    component.writeValue('Hallo');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const valueAccessors = fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);

    expect(input.id).toBe('todo-input');
    expect(input.placeholder).toBe('Text');
    expect(input.autocomplete).toBe('name');
    expect(input.value).toBe('Hallo');
    expect(label.textContent).toContain('Titel');
    expect(valueAccessors).toHaveLength(1);

    component.writeValue(undefined as unknown as string);
    fixture.detectChanges();
    expect(input.value).toBe('');
  });

  it('meldet Eingaben, Disabled-State und Fokuszustände', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoTextInput],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoTextInput);
    const component = fixture.componentInstance;
    const onChange = vi.fn();
    const onTouched = vi.fn();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const focusSpy = vi.spyOn(input, 'focus');

    input.value = 'Default';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    input.value = 'Neu';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('Neu');

    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(component.isKeyboardFocused()).toBe(true);

    input.dispatchEvent(new MouseEvent('mousedown'));
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(component.isKeyboardFocused()).toBe(false);

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(onTouched).toHaveBeenCalled();
    expect(component.isKeyboardFocused()).toBe(false);

    component.setDisabledState(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);

    component.focus();
    expect(focusSpy).toHaveBeenCalled();
  });
});
