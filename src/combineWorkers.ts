import { ContextWorker } from './index';
import { Dispatch } from 'react';

/**
 * 두개의 워커를 합쳐 하나의 워커로 만든다.
 *
 * @example
 * const state = { age: 12, young: true, };
 *
 * const ctx = contextInjector(
 *   state,
 *   combineWorkers(
 *     (dispatch, getState) => ({
 *       setAge(age: number) {
 *         dispatch({ age });
 *       },
 *     }),
 *     (dispatch, getState) => ({
 *       setYoung(young: boolean) {
 *         dispatch({ young });
 *       },
 *     }),
 *   ),
 * );
 *
 * // 컴포넌트 내부
 * const worker = ctx.useWorker();
 *
 * worker.setHaha('하하');
 *
 * @param worker1 합칠 첫번째 워커
 * @param worker2 합칠 두번째 워커
 */
export function combineWorkers<S, E1, E2>(
  worker1: ContextWorker<S, E1>,
  worker2: ContextWorker<S, E2>,
): ContextWorker<S, E1 & E2> {
  return (dispatch: Dispatch<Partial<S>>, getState: () => S) => ({
    ...worker1(dispatch, getState),
    ...worker2(dispatch, getState),
  });
}
