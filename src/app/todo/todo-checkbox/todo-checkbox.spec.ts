import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { render } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoCheckboxHarness } from './todo-checkbox.harness';
import { TodoCheckbox } from './todo-checkbox';

describe('TodoCheckbox', () => {
  ngMocks.faster();

  it('rendert und toggelt den Checkbox-Zustand', async () => {
    const { fixture } = await render(TodoCheckbox);
    const component = fixture.componentInstance;
    const changedSpy = vi.fn();

    component.changed.subscribe(changedSpy);
    fixture.componentRef.setInput('label', 'Testaufgabe');
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoCheckboxHarness);

    await expect(harness.getLabel()).resolves.toBe('Testaufgabe');
    await expect(harness.isChecked()).resolves.toBe(true);
    expect(component.checkedIcon).toBeTruthy();
    expect(component.uncheckedIcon).toBeTruthy();

    await harness.toggle();
    expect(changedSpy).toHaveBeenCalledWith(false);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    await harness.toggle();
    component.onToggle();
    expect(changedSpy).toHaveBeenCalledTimes(1);
    await expect(harness.isDisabled()).resolves.toBe(true);
  });
});
