import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FormControl, FormGroup } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ngMocks } from 'ng-mocks';

import { TodoSidebarHarness } from './todo-sidebar.harness';
import { TodoSidebar } from './todo-sidebar';

describe('TodoSidebar', () => {
  ngMocks.faster();

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
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoSidebarHarness);

    const component = fixture.componentInstance;
    const selectedSpy = vi.fn();
    const removedSpy = vi.fn();
    const addedSpy = vi.fn();

    component.listSelected.subscribe(selectedSpy);
    component.listRemoved.subscribe(removedSpy);
    component.listAdded.subscribe(addedSpy);

    await expect(harness.getListNames()).resolves.toEqual(['Privat', 'Arbeit']);
    await expect(harness.getActiveListName()).resolves.toBe('Arbeit');
    await expect(harness.hasRemoveButton('Privat')).resolves.toBe(true);
    await expect((await harness.getListInputHarness()).getLabelText()).resolves.toBe('Neue Liste');
    await expect(harness.selectList('Fehlt')).rejects.toThrow('List button not found: Fehlt');

    await harness.selectList('Privat');
    await harness.removeList('Arbeit');
    await harness.addList('Neu');

    expect(selectedSpy).toHaveBeenCalledWith(1);
    expect(removedSpy).toHaveBeenCalledWith(2);
    expect(addedSpy).toHaveBeenCalled();
  });

  it('versteckt den Close-Button bei nur einer Liste', async () => {
    const form = new FormGroup({
      name: new FormControl('', { nonNullable: true }),
    });

    const { fixture } = await render(TodoSidebar, {
      inputs: {
        lists: [{ id: 1, name: 'Privat' }],
        activeListId: 1,
        form,
        plusIcon: faPlus,
        closeIcon: faXmark,
      },
    });
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoSidebarHarness);

    await expect(harness.getListNames()).resolves.toEqual(['Privat']);
    await expect(harness.getActiveListName()).resolves.toBe('Privat');
    await expect(harness.hasRemoveButton('Privat')).resolves.toBe(false);
    expect(screen.queryByRole('button', { name: 'Liste löschen: Privat' })).toBeNull();

    fixture.componentRef.setInput('activeListId', 999);
    fixture.detectChanges();
    await expect(harness.getActiveListName()).resolves.toBeNull();
  });
});
