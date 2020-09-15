var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
export function combineInteractors(inter1, inter2) {
    return function (state, dispatch) { return (__assign(__assign({}, inter1(state, dispatch)), inter2(state, dispatch))); };
}
