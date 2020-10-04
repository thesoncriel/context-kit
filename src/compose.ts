/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ComponentType } from 'react';
import { ContextInjectorResult } from './index';

/**
 * 여러개의 High-Order Component 를 묶어서 하나의 HOC 로 만들어 준다.
 *
 * 타입이 contextInjector 의 결과물인 ContextInjectorResult 일 경우 자동으로 내부의 withCtx 를 이용하여 묶어준다.
 *
 * @example
 *
 * // hoc 여러개 사용 예시
 * const DecoratedComponent = compose(
 *   withHoc1,
 *   withHoc2,
 *   withHoc3,
 * )(NormalComponent);
 *
 * // contextInjector 결과물과 연계
 * const ctx0 = contextInjector(getInitState0(), worker0());
 * const ctx1 = contextInjector(getInitState1(), worker1());
 * const ctx2 = contextInjector(getInitState2(), worker2());
 *
 * const EnhancedContainer = compose(
 *   ctx0, ctx1, ctx2
 * )(NormalComponent);
 *
 * @param args High-Order Component 혹은 ContextInjectorResult
 */
export function compose(
  ...args: Array<
    | ((Comp: ComponentType<any>) => ComponentType<any>)
    | ContextInjectorResult<any, any>
  >
) {
  function ReturnComp<P, R = P>(Comp: ComponentType<P>): ComponentType<R> {
    const enhanced = args.reduceRight((AccComp, hoc) => {
      if (typeof hoc === 'object') {
        return hoc.withCtx(AccComp);
      }
      return hoc(AccComp);
    }, Comp);

    return (enhanced as unknown) as ComponentType<R>;
  }

  return ReturnComp;
}
