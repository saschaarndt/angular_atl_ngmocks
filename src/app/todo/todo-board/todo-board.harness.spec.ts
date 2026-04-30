import '../../../test-setup';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { render } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoBoardHarness } from './todo-board.harness';
import { TodoBoard } from './todo-board';

describe('TodoBoardHarness', () => {
  ngMocks.faster();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delegiert Board-Interaktionen an die verschachtelten Harnesses', async () => {
    const { fixture } = await render(TodoBoard);
    const component = fixture.componentInstance;
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TodoBoardHarness);

    await expect(harness.getTitle()).resolves.toContain('Meine Aufgaben');
    await expect(harness.getClaim()).resolves.toContain('Damit ich es nicht im Kopf haben muss.');
    await expect(harness.hasCard()).resolves.toBe(true);
    await expect(harness.getCardHarness()).resolves.toBeTruthy();
    await expect(harness.getSidebarHarness()).resolves.toBeTruthy();

    await harness.selectList('Büro');
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.activeListId()).toBe(2);

    await harness.addList('Neue Liste');
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.lists().some((list) => list.name === 'Neue Liste')).toBe(true);

    await harness.removeList('Neue Liste');
    fixture.detectChanges();
    vi.runAllTimers();
    expect(component.lists().some((list) => list.name === 'Neue Liste')).toBe(false);
  });
});
