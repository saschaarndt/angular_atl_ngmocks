import '../../../test-setup';
import { fireEvent, render, screen } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

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

    const button = screen.getByRole('checkbox', { name: 'Testaufgabe' }) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Testaufgabe');
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(component.checkedIcon).toBeTruthy();
    expect(component.uncheckedIcon).toBeTruthy();

    fireEvent.click(button);
    expect(changedSpy).toHaveBeenCalledWith(false);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    fireEvent.click(button);
    component.onToggle();
    expect(changedSpy).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
  });
});
