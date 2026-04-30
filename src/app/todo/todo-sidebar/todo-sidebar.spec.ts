import { FormControl, FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

import { TodoSidebar } from './todo-sidebar';

describe('TodoSidebar', () => {
  const form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
  });

  it('rendert Listen und emittiert Events', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoSidebar],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoSidebar);
    const component = fixture.componentInstance;
    const selectedSpy = vi.fn();
    const removedSpy = vi.fn();
    const addedSpy = vi.fn();

    component.listSelected.subscribe(selectedSpy);
    component.listRemoved.subscribe(removedSpy);
    component.listAdded.subscribe(addedSpy);

    fixture.componentRef.setInput('lists', [
      { id: 1, name: 'Privat' },
      { id: 2, name: 'Arbeit' },
    ]);
    fixture.componentRef.setInput('activeListId', 2);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('plusIcon', faPlus);
    fixture.componentRef.setInput('closeIcon', faXmark);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.todo-sidebar__tab'),
    ) as HTMLButtonElement[];
    const closeButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.todo-sidebar__tab-close'),
    ) as HTMLButtonElement[];
    const addForm = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    expect(buttons).toHaveLength(2);
    expect(closeButtons).toHaveLength(2);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');

    buttons[0].click();
    closeButtons[1].click();
    addForm.dispatchEvent(new Event('submit'));

    expect(selectedSpy).toHaveBeenCalledWith(1);
    expect(removedSpy).toHaveBeenCalledWith(2);
    expect(addedSpy).toHaveBeenCalled();
  });

  it('versteckt den Close-Button bei nur einer Liste', async () => {
    await TestBed.configureTestingModule({
      imports: [TodoSidebar],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoSidebar);

    fixture.componentRef.setInput('lists', [{ id: 1, name: 'Privat' }]);
    fixture.componentRef.setInput('activeListId', 1);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('plusIcon', faPlus);
    fixture.componentRef.setInput('closeIcon', faXmark);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.todo-sidebar__tab-close')).toBeNull();
  });
});
