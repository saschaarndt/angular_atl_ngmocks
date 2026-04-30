import '../../../test-setup';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ngMocks } from 'ng-mocks';

import { TodoTextInput } from './todo-text-input';

describe('TodoTextInput', () => {
  ngMocks.faster();

  it('bindet Werte und Attribute korrekt', async () => {
    const { fixture } = await render(TodoTextInput, {
      inputs: {
        label: 'Titel',
        id: 'todo-input',
        placeholder: 'Text',
        autocomplete: 'name',
      },
    });
    const component = fixture.componentInstance;

    component.writeValue('Hallo');
    fixture.detectChanges();

    const input = screen.getByLabelText('Titel') as HTMLInputElement;
    const label = screen.getByText('Titel') as HTMLLabelElement;
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
    const { fixture } = await render(TodoTextInput, {
      inputs: {
        label: 'Eingabe',
      },
    });
    const component = fixture.componentInstance;
    const onChange = vi.fn();
    const onTouched = vi.fn();

    const input = screen.getByLabelText('Eingabe') as HTMLInputElement;
    const focusSpy = vi.spyOn(input, 'focus');

    input.value = 'Default';
    fireEvent.input(input);
    fireEvent.blur(input);
    fixture.detectChanges();

    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    input.value = 'Neu';
    fireEvent.input(input);
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('Neu');

    fireEvent.focus(input);
    fixture.detectChanges();
    expect(component.isKeyboardFocused()).toBe(true);

    fireEvent.mouseDown(input);
    fireEvent.focus(input);
    fixture.detectChanges();
    expect(component.isKeyboardFocused()).toBe(false);

    fireEvent.blur(input);
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
