import { ContextInteractor } from './index';
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
 *       (state, dispatch) => ({
 *         setHaha(haha: string) {
 *           dispatch({ ...state, haha });
 *         },
 *       }),
 *       (state, dispatch) => ({
 *         setAge(age: number) {
 *           dispatch({ ...state, age });
 *         },
 *       }),
 *     ),
 *     (state, dispatch) => ({
 *       setYoung(young: boolean) {
 *         dispatch({ ...state, young });
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
export declare function combineInteractors<S, E1, E2>(inter1: ContextInteractor<S, E1>, inter2: ContextInteractor<S, E2>): ContextInteractor<S, E1 & E2>;
