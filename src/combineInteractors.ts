import { ContextInteractor } from './index';
import { Dispatch } from 'react';

/**
 * 두개의 인터렉터를 합쳐 하나의 인터렉터로 만든다.
 *
 * 3개 이상의 인터렉터를 합친다면 아래처럼 중첩하여 수행 하면 된다.
 * @example
 * const state = { haha: '', age: 12, young: true, };
 *
 * const ctx = contextInjector(
 *   state,
 *   combineInteractors(
 *     combineInteractors(
 *       (dispatch, getState) => ({
 *         setHaha(haha: string) {
 *           dispatch({ haha });
 *         },
 *       }),
 *       (dispatch, getState) => ({
 *         setAge(age: number) {
 *           dispatch({ age });
 *         },
 *       }),
 *     ),
 *     (dispatch, getState) => ({
 *       setYoung(young: boolean) {
 *         dispatch({ young });
 *       },
 *     }),
 *   ),
 * );
 *
 * // 컴포넌트 내부
 * const inter = ctx.useInteractor();
 *
 * inter.setHaha('하하');
 *
 * @param inter1 합칠 첫번째 인터렉터
 * @param inter2 합칠 두번째 인터렉터
 */
export function combineInteractors<S, E1, E2>(
  inter1: ContextInteractor<S, E1>,
  inter2: ContextInteractor<S, E2>,
): ContextInteractor<S, E1 & E2> {
  return (dispatch: Dispatch<Partial<S>>, getState: () => S) => ({
    ...inter1(dispatch, getState),
    ...inter2(dispatch, getState),
  });
}
