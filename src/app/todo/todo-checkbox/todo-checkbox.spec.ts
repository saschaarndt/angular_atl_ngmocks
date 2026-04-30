import { TestBed } from '@angular/core/testing';

import { TodoCheckbox } from './todo-checkbox';

describe('TodoCheckbox', () => {
  it('rendert und toggelt den Checkbox-Zustand', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoCheckbox],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoCheckbox);
    const component = fixture.componentInstance;
    const changedSpy = vi.fn();

    component.changed.subscribe(changedSpy);
    fixture.componentRef.setInput('label', 'Testaufgabe');
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Testaufgabe');
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(component.checkedIcon).toBeTruthy();
    expect(component.uncheckedIcon).toBeTruthy();

    button.click();
    expect(changedSpy).toHaveBeenCalledWith(false);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    button.click();
    component.onToggle();
    expect(changedSpy).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
  });
});
