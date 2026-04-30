import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { fireEvent, render, screen } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoTextInputHarness } from './todo-text-input.harness';
import { TodoTextInput } from './todo-text-input';

describe('TodoTextInputHarness', () => {
  ngMocks.faster();

  it('liest und steuert die Eingabe ueber die Harness-API', async () => {
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
    const onChange = vi.fn();
    const onTouched = vi.fn();

    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);
    component.writeValue('Start');
    fixture.detectChanges();

    await expect(harness.getLabelText()).resolves.toBe('Titel');
    await expect(harness.getValue()).resolves.toBe('Start');
    await expect(harness.getPlaceholder()).resolves.toBe('Text');
    await expect(harness.getAutocomplete()).resolves.toBe('name');

    await harness.setValue('Neu');
    await expect(harness.getValue()).resolves.toBe('Neu');
    expect(onChange).toHaveBeenCalledWith('Neu');

    await harness.focus();
    await expect(harness.isKeyboardFocused()).resolves.toBe(true);

    const input = screen.getByLabelText('Titel') as HTMLInputElement;
    fireEvent.mouseDown(input);
    await harness.focus();
    await expect(harness.isKeyboardFocused()).resolves.toBe(false);

    await harness.blur();
    expect(onTouched).toHaveBeenCalled();

    component.setDisabledState(true);
    fixture.detectChanges();
    await expect(harness.isDisabled()).resolves.toBe(true);
  });
});
