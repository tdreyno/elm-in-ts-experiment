import { Unionized, UnionOf } from "unionize";

type GenericUnionized = Unionized<any, any, any>;
type GenericUnion = UnionOf<GenericUnionized>;
type SideEffectResult<A extends GenericUnion | void> = Promise<A>;
type SideEffect<A extends GenericUnion | void> = () => SideEffectResult<A>;
type UpdateResult<A extends GenericUnion, M extends GenericUnion> = [
  M,
  SideEffect<A>,
];
type UpdateFn<A extends GenericUnion, M extends GenericUnion> = (
  action: A,
) => (model: M) => UpdateResult<A | void, M>;

export function effect<
  F extends (...args: any[]) => any,
  A = ReturnType<F> extends SideEffectResult<infer R> ? R : never
>(fn: F): (...args: Parameters<F>) => SideEffect<A> {
  return (...args: Parameters<F>) => async () => {
    return fn(...args);
  };
}

export function t<M extends GenericUnion, A extends GenericUnion>(
  model: M,
  action: SideEffect<A | void>,
): UpdateResult<A | void, M> {
  return [model, action];
}

export async function run<A extends GenericUnion, M extends GenericUnion>(
  updateFn: UpdateFn<A, M>,
  model: M,
  action: A,
): Promise<GenericUnion> {
  const [nextState, effects] = updateFn(action)(model);

  const nextAction = await effects();

  if (nextAction) {
    return run(updateFn, nextState, nextAction);
  }

  return nextState;
}

export const NONE: SideEffect<void> = async () => void 0;

// tslint:disable-next-line:no-console
export const log = effect(console.log.bind(console));
