import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ngMocks } from 'ng-mocks';

import { TodoTextInputHarness } from './todo-text-input.harness';
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
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      TodoTextInputHarness,
    );

    component.writeValue('Hallo');
    fixture.detectChanges();

    const label = screen.getByText('Titel') as HTMLLabelElement;
    const valueAccessors = fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);

    await expect(harness.getLabelText()).resolves.toBe('Titel');
    await expect(harness.getPlaceholder()).resolves.toBe('Text');
    await expect(harness.getAutocomplete()).resolves.toBe('name');
    await expect(harness.getValue()).resolves.toBe('Hallo');
    expect(label.textContent).toContain('Titel');
    expect(valueAccessors).toHaveLength(1);

    component.writeValue(undefined as unknown as string);
    fixture.detectChanges();
    await expect(harness.getValue()).resolves.toBe('');
  });

  it('meldet Eingaben, Disabled-State und Fokuszustände', async () => {
    const { fixture } = await render(TodoTextInput, {
      inputs: {
        label: 'Eingabe',
      },
    });
    const component = fixture.componentInstance;
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      TodoTextInputHarness,
    );
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

    await harness.setValue('Neu');

    expect(onChange).toHaveBeenCalledWith('Neu');
    await expect(harness.getValue()).resolves.toBe('Neu');

    await harness.focus();
    expect(component.isKeyboardFocused()).toBe(true);
    await expect(harness.isKeyboardFocused()).resolves.toBe(true);

    fireEvent.mouseDown(input);
    await harness.focus();
    expect(component.isKeyboardFocused()).toBe(false);
    await expect(harness.isKeyboardFocused()).resolves.toBe(false);

    await harness.blur();
    expect(onTouched).toHaveBeenCalled();
    expect(component.isKeyboardFocused()).toBe(false);

    component.setDisabledState(true);
    fixture.detectChanges();
    await expect(harness.isDisabled()).resolves.toBe(true);

    component.focus();
    expect(focusSpy).toHaveBeenCalled();

    await harness.setValue('');
    await expect(harness.getValue()).resolves.toBe('');
  });
});
