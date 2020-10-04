import React, { FC } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import contextInjector from 'context-kit';
import { getInitCtxState, TestComp, CtxState } from './test-materials';

Enzyme.configure({ adapter: new Adapter() });

describe('context injector - 기본 기능', () => {
  const ctx = contextInjector(getInitCtxState(), () => ({}));
  const TestContainer: FC = () => {
    const state = ctx.useCtxSelectorAll();

    return <TestComp {...state} />;
  };

  const ContainerWithCtx = ctx.withCtx(TestContainer);
  let mountTarget: ReturnType<typeof mount>;

  beforeEach(() => {
    mountTarget = mount(<ContainerWithCtx />) as ReturnType<typeof mount>;
  });

  afterEach(() => {
    if (mountTarget) {
      mountTarget.unmount();
    }
  });

  it('withCtx 를 이용하면 HOC 타깃 컨테이너가 함께 렌더링 된다.', () => {
    expect(mountTarget.find(TestContainer).length).toBe(1);
  });

  it('렌더링 시 초기 상태가 하위 컴포넌트에 전달 된다.', () => {
    const childResult = mountTarget.find(TestComp);

    expect(childResult.length).toBe(1);
    expect(childResult.props()).toEqual(getInitCtxState());
  });

  it('useCtxSelector 사용 시 상태값을 원하는 값으로 변환하여 줄 수 있다.', () => {
    const ctxSub = contextInjector(getInitCtxState(), () => ({}));
    const selIsOldBoy = jest.fn((state: CtxState) => {
      return state.age > 30;
    });
    const SubTestContainer: FC = () => {
      const isOldBoy = ctxSub.useCtxSelector(selIsOldBoy);

      return <h1>나는 {isOldBoy ? '영감탱 ㅠㅠ' : '아직 청년 ^.^)v'}</h1>;
    };
    const SubTestWithCtx = ctxSub.withCtx(SubTestContainer);
    const mountSubTarget = mount(<SubTestWithCtx />);
    const childResult = mountSubTarget.find('h1');

    expect(selIsOldBoy).toHaveBeenCalled();
    expect(selIsOldBoy).toHaveLastReturnedWith(false);
    expect(childResult.prop('children')).toEqual(['나는 ', '아직 청년 ^.^)v']);

    mountSubTarget.unmount();
  });

  it('dispatch 하여 상태값을 바꿀 수 있다.', () => {
    const ctxSub = contextInjector(getInitCtxState(), () => ({}));
    const SubTestContainer: FC = () => {
      const state = ctxSub.useCtxSelectorAll();
      const dispatch = ctxSub.useCtxDispatch();

      const handleClick = () => {
        dispatch({
          age: 37,
        });
      };

      return (
        <button type="button" onClick={handleClick}>
          {state.age}
        </button>
      );
    };
    const SubTestWithCtx = ctxSub.withCtx(SubTestContainer);
    const mountTarget = mount(<SubTestWithCtx />);
    let childResult = mountTarget.find('button');

    expect(childResult.prop('children')).toEqual(getInitCtxState().age);
    childResult.simulate('click', {});
    childResult = mountTarget.find('button');
    expect(childResult.prop('children')).toEqual(37);

    mountTarget.unmount();
  });
});
