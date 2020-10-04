/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, FC, ComponentType } from 'react';

/**
 * 컨텍스트의 상태값을 바탕으로 업무 로직을 구성할 때 쓰이는 인터렉터(Interactor).
 */
export interface ContextInteractor<S = any, E = any> {
  (dispatch: Dispatch<Partial<S>>, state: () => S): E;
}

/**
 * 컨텍스트 상태 모델. state 와 자료를 적용시키는 apply 로 구성된다.
 */
export interface ContextState<T> {
  /**
   * 컨텍스트 상태.
   */
  state: T;
  /**
   * 컨텍스트 상태를 변경하기 위한 메서드.
   */
  dispatch: Dispatch<SetStateAction<T>>;
}

/**
 * 컨텍스트 인젝터로 만들어진 결과물.
 */
export interface ContextInjectorResult<T, IT> {
  /**
   * 컨텍스트용 디스패치. 변경된 상태 전체를 넘기면 컨텍스트에 반영된다.
   */
  useCtxDispatch: () => Dispatch<Partial<T>>;
  /**
   * HOC: 컨텍스트를 Decorator 형식으로 이용 할 수 있다.
   */
  withCtx: <P>(Comp: ComponentType<P>) => FC<P>;
  /**
   * 컨텍스트용 셀렉터. 가져오고 싶은 데이터만 선택할 수 있다.
   */
  useCtxSelector: <R>(selector: (state: T) => R) => R;
  /**
   * 컨텍트스용 셀렉터. 해당 컨텍스트의 모든 상태값을 가져올 수 있다.
   */
  useCtxSelectorAll: () => T;
  /**
   * 컨텍스트용 인터렉터. 액션 및 데이터 호출, 조작 및 디스패치등의 기능을 가진 객체를 가져와 사용할 수 있다.
   */
  useInteractor: () => IT;
  /**
   * 컨텍스트 인젝터 결과물을 복사한다.
   *
   * 하나의 컨텍스트를 다른 곳에서 똑같이 쓰되 상태가 겹치면 안될 때 쓰인다.
   */
  clone: () => ContextInjectorResult<T, IT>;
}
