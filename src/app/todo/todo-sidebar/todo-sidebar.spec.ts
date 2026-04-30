import { FormControl, FormGroup } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

import { TodoSidebar } from './todo-sidebar';

describe('TodoSidebar', () => {
  it('rendert Listen und emittiert Events', async () => {
    const form = new FormGroup({
      name: new FormControl('', { nonNullable: true }),
    });
    const { fixture } = await render(TodoSidebar, {
      inputs: {
        lists: [
          { id: 1, name: 'Privat' },
          { id: 2, name: 'Arbeit' },
        ],
        activeListId: 2,
        form,
        plusIcon: faPlus,
        closeIcon: faXmark,
      },
    });

    const component = fixture.componentInstance;
    const selectedSpy = vi.fn();
    const removedSpy = vi.fn();
    const addedSpy = vi.fn();

    component.listSelected.subscribe(selectedSpy);
    component.listRemoved.subscribe(removedSpy);
    component.listAdded.subscribe(addedSpy);

    const buttons = [
      screen.getByRole('button', { name: 'Privat' }),
      screen.getByRole('button', { name: 'Arbeit' }),
    ] as HTMLButtonElement[];
    const closeButtons = [
      screen.getByRole('button', { name: 'Liste löschen: Privat' }),
      screen.getByRole('button', { name: 'Liste löschen: Arbeit' }),
    ] as HTMLButtonElement[];
    const addButton = screen.getByRole('button', { name: 'Liste hinzufügen' });

    expect(buttons).toHaveLength(2);
    expect(closeButtons).toHaveLength(2);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(buttons[0]);
    fireEvent.click(closeButtons[1]);
    fireEvent.click(addButton);

    expect(selectedSpy).toHaveBeenCalledWith(1);
    expect(removedSpy).toHaveBeenCalledWith(2);
    expect(addedSpy).toHaveBeenCalled();
  });

  it('versteckt den Close-Button bei nur einer Liste', async () => {
    const form = new FormGroup({
      name: new FormControl('', { nonNullable: true }),
    });

    await render(TodoSidebar, {
      inputs: {
        lists: [{ id: 1, name: 'Privat' }],
        activeListId: 1,
        form,
        plusIcon: faPlus,
        closeIcon: faXmark,
      },
    });

    expect(screen.queryByRole('button', { name: 'Liste löschen: Privat' })).toBeNull();
  });
});
