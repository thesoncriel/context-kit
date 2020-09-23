import React, {
  ComponentType,
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react';
import appConfig from './app.config';
import {
  ContextInjectorResult,
  ContextInteractor,
  ContextState,
} from './models';

/**
 * 상태 관리에 이용할 컨텍스트와 이를 이용하기 위한 각종 컴포넌트와 훅(hooks)을 만들어서 제공한다.
 *
 * 필요한 상태값 및 중간 처리기인 인터렉터(interactor) 를 구현해서 주입(inject) 해 주어야 한다.
 * @param initState 초기 상태값
 * @param interactor 상태에 대한 액션과 변경 및 dispatch 를 수행하는 이펙트 함수가 모여진 객체 ...를 만들어주는 함수.
 */
export function contextInjector<T, IT>(
  initState: T,
  interactor: ContextInteractor<T, IT>,
): ContextInjectorResult<T, IT> {
  const InjectedContext = createContext<ContextState<T>>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispatch: () => {},
    state: initState,
  });
  const ContextProvider = InjectedContext.Provider;
  let isAleadyUsed = false;
  let cachedState: T | null = null;
  let cachedInteractor: IT | null = null;
  let cachedDispatch: ((currState: Partial<T>) => void) | null = null;
  let usingCounts = 0;
  let ctxWrapped = false;

  const CtxProvider: FC = ({ children }) => {
    const [state, dispatch] = useState({ ...initState });

    useEffect(() => {
      if (usingCounts > 0) {
        try {
          // eslint-disable-next-line no-console
          console.warn('Context is aleady used!');
        } catch (error) {
          //
        }
      }
      usingCounts++;

      return () => {
        isAleadyUsed = false;
        cachedState = null;
        usingCounts--;
        ctxWrapped = false;
        cachedInteractor = null;
        cachedDispatch = null;
      };
    }, []);

    ctxWrapped = true;
    isAleadyUsed = true;
    cachedState = state;

    return (
      <ContextProvider value={{ dispatch, state }}>{children}</ContextProvider>
    );
  };
  const withCtx = function <P>(Comp: ComponentType<P>) {
    const ReturnComp: FC<P> = (props) => {
      return (
        <CtxProvider>
          <Comp {...props} />
        </CtxProvider>
      );
    };
    return ReturnComp;
  };
  const useCtxSelector = function <R>(selector: (state: T) => R) {
    const { state } = useContext(InjectedContext);
    return selector(state);
  };
  const useCtxSelectorAll = () => {
    const { state } = useContext(InjectedContext);
    return state;
  };
  const useCtxDispatch = () => {
    const { dispatch } = useContext(InjectedContext);

    if (cachedDispatch === null) {
      cachedDispatch = (currState: Partial<T>) => {
        dispatch((prevState: T) => ({
          ...prevState,
          ...currState,
        }));
      };
    }

    return cachedDispatch;
  };
  const useInteractor = (): IT => {
    const { state, dispatch } = useContext(InjectedContext);

    if (!ctxWrapped) {
      if (appConfig.development) {
        // eslint-disable-next-line no-console
        console.warn('context is not wrapped. - state hint:', state);
      }
    }

    if (cachedInteractor === null) {
      cachedInteractor = interactor(
        () => cachedState || state,
        (currState: Partial<T>) => {
          if (!isAleadyUsed) {
            if (appConfig.development) {
              // eslint-disable-next-line no-console
              console.log('canceled');
            }
            return;
          }
          dispatch((prevState: T) => ({
            ...prevState,
            ...currState,
          }));
        },
      );
    }
    return cachedInteractor;
  };

  const clone = () => contextInjector(initState, interactor);

  return {
    CtxProvider,
    useCtxDispatch,
    useCtxSelector,
    useCtxSelectorAll,
    useInteractor,
    withCtx,
    clone,
  };
}
