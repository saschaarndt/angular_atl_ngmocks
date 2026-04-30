import {
  signal,
  type Provider,
  type ProviderToken,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { vi } from 'vitest';

type AnyFunction = (...args: never[]) => unknown;

type ResolvedStore<TStore> =
  TStore extends ProviderToken<infer TProvided>
    ? TProvided
    : TStore extends object
      ? TStore
      : never;

type SignalKeys<TStore> = Extract<
  {
    [TKey in keyof ResolvedStore<TStore>]: ResolvedStore<TStore>[TKey] extends Signal<unknown>
      ? TKey
      : never;
  }[keyof ResolvedStore<TStore>],
  keyof ResolvedStore<TStore>
>;

type MethodKeys<TStore> = Extract<
  {
    [TKey in keyof ResolvedStore<TStore>]: ResolvedStore<TStore>[TKey] extends AnyFunction
      ? TKey
      : never;
  }[keyof ResolvedStore<TStore>],
  keyof ResolvedStore<TStore>
>;

type PropertyKeys<TStore> = Exclude<
  keyof ResolvedStore<TStore>,
  SignalKeys<TStore> | MethodKeys<TStore>
>;

type SignalValue<TValue> = TValue extends Signal<infer TSignalValue> ? TSignalValue : never;

type MockedMethod<TValue> = TValue extends (...args: infer TArgs) => infer TReturn
  ? ReturnType<typeof vi.fn<(...args: TArgs) => TReturn>>
  : never;

export type SignalStoreMock<TStore> = {
  [TKey in SignalKeys<TStore>]: ResolvedStore<TStore>[TKey] extends Signal<infer TSignalValue>
    ? WritableSignal<TSignalValue>
    : never;
} & {
  [TKey in MethodKeys<TStore>]: MockedMethod<ResolvedStore<TStore>[TKey]>;
} & {
  [TKey in PropertyKeys<TStore>]: ResolvedStore<TStore>[TKey];
};

type SignalStateConfig<TStore> = Partial<{
  [TKey in SignalKeys<TStore>]:
    | SignalValue<ResolvedStore<TStore>[TKey]>
    | WritableSignal<SignalValue<ResolvedStore<TStore>[TKey]>>;
}>;

type MethodImplementationConfig<TStore> = Partial<{
  [TKey in MethodKeys<TStore>]: ResolvedStore<TStore>[TKey];
}>;

type PropertyConfig<TStore> = Partial<Pick<ResolvedStore<TStore>, PropertyKeys<TStore>>>;

export interface CreateSignalStoreMockOptions<TStore> {
  state?: SignalStateConfig<TStore>;
  methods?: readonly MethodKeys<TStore>[];
  methodImpls?: MethodImplementationConfig<TStore>;
  props?: PropertyConfig<TStore>;
}

function isWritableSignal<TValue>(value: unknown): value is WritableSignal<TValue> {
  return (
    typeof value === 'function' &&
    'set' in value &&
    typeof value.set === 'function' &&
    'update' in value &&
    typeof value.update === 'function'
  );
}

export function createSignalStoreMock<TStore>(
  options: CreateSignalStoreMockOptions<TStore> = {},
): SignalStoreMock<TStore> {
  const storeMock: Record<string, unknown> = {
    ...(options.props ?? {}),
  };

  for (const [key, value] of Object.entries(options.state ?? {})) {
    storeMock[key] = isWritableSignal(value) ? value : signal(value);
  }

  const methodNames = new Set<string>([
    ...((options.methods ?? []) as readonly PropertyKey[]).map(String),
    ...Object.keys(options.methodImpls ?? {}),
  ]);

  for (const methodName of methodNames) {
    const implementation = options.methodImpls?.[methodName as MethodKeys<TStore>] as
      | AnyFunction
      | undefined;
    storeMock[methodName] = implementation ? vi.fn(implementation) : vi.fn();
  }

  return storeMock as SignalStoreMock<TStore>;
}

export function provideMockSignalStore<TStore>(
  token: ProviderToken<TStore>,
  options: CreateSignalStoreMockOptions<TStore> = {},
): Provider {
  return {
    provide: token,
    useValue: createSignalStoreMock(options),
  };
}
