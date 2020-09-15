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
import React, { createContext, useContext, useEffect, useState, } from 'react';
import appConfig from './app.config';
import { nop } from './util';
/**
 * 상태 관리에 이용할 컨텍스트와 이를 이용하기 위한 각종 컴포넌트와 훅(hooks)을 만들어서 제공한다.
 *
 * 필요한 상태값 및 중간 처리기인 인터렉터(interactor) 를 구현해서 주입(inject) 해 주어야 한다.
 * @param initState 초기 상태값
 * @param interactor 상태에 대한 액션과 변경 및 dispatch 를 수행하는 이펙트 함수가 모여진 객체 ...를 만들어주는 함수.
 */
export function contextInjector(initState, interactor) {
    var InjectedContext = createContext({
        dispatch: nop,
        state: initState,
    });
    var ContextProvider = InjectedContext.Provider;
    var isAleadyUsed = false;
    var cachedState = null;
    var cachedInteractor = null;
    var cachedDispatch = null;
    var usingCounts = 0;
    var ctxWrapped = false;
    var CtxProvider = function (_a) {
        var children = _a.children;
        var _b = useState(__assign({}, initState)), state = _b[0], dispatch = _b[1];
        useEffect(function () {
            if (usingCounts > 0) {
                try {
                    // eslint-disable-next-line no-console
                    console.warn('Context is aleady used!');
                }
                catch (error) {
                    //
                }
            }
            usingCounts++;
            return function () {
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
        return (React.createElement(ContextProvider, { value: { dispatch: dispatch, state: state } }, children));
    };
    var withCtx = function (Comp) {
        var ReturnComp = function (props) {
            return (React.createElement(CtxProvider, null,
                React.createElement(Comp, __assign({}, props))));
        };
        return ReturnComp;
    };
    var useCtxSelector = function (selector) {
        var state = useContext(InjectedContext).state;
        return selector(state);
    };
    var useCtxSelectorAll = function () {
        var state = useContext(InjectedContext).state;
        return state;
    };
    var useCtxDispatch = function () {
        var dispatch = useContext(InjectedContext).dispatch;
        if (cachedDispatch === null) {
            cachedDispatch = function (currState) {
                dispatch(function (prevState) { return (__assign(__assign({}, prevState), currState)); });
            };
        }
        return cachedDispatch;
    };
    var useInteractor = function () {
        var _a = useContext(InjectedContext), state = _a.state, dispatch = _a.dispatch;
        if (!ctxWrapped) {
            if (appConfig.development) {
                // eslint-disable-next-line no-console
                console.warn('context is not wrapped. - state hint:', state);
            }
        }
        if (cachedInteractor === null) {
            cachedInteractor = interactor(function () { return cachedState || state; }, function (currState) {
                if (!isAleadyUsed) {
                    if (appConfig.development) {
                        // eslint-disable-next-line no-console
                        console.log('canceled');
                    }
                    return;
                }
                dispatch(function (prevState) { return (__assign(__assign({}, prevState), currState)); });
            });
        }
        return cachedInteractor;
    };
    var clone = function () { return contextInjector(initState, interactor); };
    return {
        CtxProvider: CtxProvider,
        useCtxDispatch: useCtxDispatch,
        useCtxSelector: useCtxSelector,
        useCtxSelectorAll: useCtxSelectorAll,
        useInteractor: useInteractor,
        withCtx: withCtx,
        clone: clone,
    };
}
