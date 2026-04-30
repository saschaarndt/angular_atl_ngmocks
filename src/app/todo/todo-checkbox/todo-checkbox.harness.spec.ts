import '../../../test-setup';
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { ngMocks } from 'ng-mocks';

import { TodoCheckboxHarness } from './todo-checkbox.harness';
import { TodoCheckbox } from './todo-checkbox';

@Component({
  imports: [TodoCheckbox],
  template: `
    <app-todo-checkbox label="Alpha" [disabled]="true" (changed)="onAlphaChanged($event)" />
    <app-todo-checkbox label="Beta" [checked]="true" (changed)="onBetaChanged($event)" />
  `,
})
class TodoCheckboxHarnessHost {
  alphaChanged: boolean | null = null;
  betaChanged: boolean | null = null;

  onAlphaChanged(value: boolean): void {
    this.alphaChanged = value;
  }

  onBetaChanged(value: boolean): void {
    this.betaChanged = value;
  }
}

class MissingTodoCheckboxHarness extends ComponentHarness {
  static hostSelector = 'app-todo-checkbox';

  static with(options: BaseHarnessFilters = {}): HarnessPredicate<MissingTodoCheckboxHarness> {
    return new HarnessPredicate(MissingTodoCheckboxHarness, options).addOption(
      'label',
      'Gamma',
      async () => false,
    );
  }
}

describe('TodoCheckboxHarness', () => {
  ngMocks.faster();

  it('findet Checkboxen per Label-Predicate und liest ihren Zustand', async () => {
    const { fixture } = await render(TodoCheckboxHarnessHost);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const alphaHarness = await loader.getHarness(TodoCheckboxHarness.with({ label: 'Alpha' }));
    const betaHarness = await loader.getHarness(TodoCheckboxHarness.with({ label: 'Beta' }));

    await expect(alphaHarness.getLabel()).resolves.toBe('Alpha');
    await expect(alphaHarness.isDisabled()).resolves.toBe(true);
    await expect(alphaHarness.isChecked()).resolves.toBe(false);
    await expect(betaHarness.getLabel()).resolves.toBe('Beta');
    await expect(betaHarness.isChecked()).resolves.toBe(true);

    await betaHarness.toggle();

    expect(fixture.componentInstance.betaChanged).toBe(false);
    await expect(loader.getHarness(MissingTodoCheckboxHarness.with())).rejects.toThrow();
  });
});
