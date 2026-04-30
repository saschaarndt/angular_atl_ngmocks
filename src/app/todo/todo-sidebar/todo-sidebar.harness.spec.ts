import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FormControl, FormGroup } from '@angular/forms';
import { render } from '@testing-library/angular';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ngMocks } from 'ng-mocks';

import { TodoSidebarHarness } from './todo-sidebar.harness';
import { TodoSidebar } from './todo-sidebar';

describe('TodoSidebarHarness', () => {
  ngMocks.faster();

  it('liest Listen, delegiert Interaktionen und liefert die Input-Harness', async () => {
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
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoSidebarHarness);
    const selectedSpy = vi.fn();
    const removedSpy = vi.fn();
    const addedSpy = vi.fn();

    component.listSelected.subscribe(selectedSpy);
    component.listRemoved.subscribe(removedSpy);
    component.listAdded.subscribe(addedSpy);

    await expect(harness.getListNames()).resolves.toEqual(['Privat', 'Arbeit']);
    await expect(harness.getActiveListName()).resolves.toBe('Arbeit');
    await expect(harness.hasRemoveButton('Privat')).resolves.toBe(true);

    const inputHarness = await harness.getListInputHarness();
    await expect(inputHarness.getLabelText()).resolves.toBe('Neue Liste');

    await harness.selectList('Privat');
    await harness.removeList('Arbeit');
    await harness.addList('Neu');

    expect(selectedSpy).toHaveBeenCalledWith(1);
    expect(removedSpy).toHaveBeenCalledWith(2);
    expect(addedSpy).toHaveBeenCalled();
    await expect(harness.selectList('Fehlt')).rejects.toThrow('List button not found: Fehlt');
  });
});
