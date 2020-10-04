import contextInjector from 'context-kit';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React, { FC, useEffect } from 'react';
import { CtxState, getInitCtxState } from './test-materials';

Enzyme.configure({ adapter: new Adapter() });

describe('context injector - 멀티 디스패치', () => {
  const ctx = contextInjector(getInitCtxState(), () => ({}));
  const TestContainer: FC = () => {
    const { name, age, likeCounts } = ctx.useCtxSelectorAll();
    const dispatch = ctx.useCtxDispatch();

    const handleClick = () => {
      dispatch({
        age: 41,
      });
    };

    const handleLikeClick = (count: number) => () => {
      dispatch({
        likeCounts: likeCounts + count,
      });
    };

    const handleToSonic = () => {
      dispatch({
        age: 12,
        name: '쏘닉',
      });
    };

    useEffect(() => {
      dispatch({
        loading: true,
      });
    }, [dispatch]);

    return (
      <>
        <ul>
          <li className="name">이름: {name}</li>
          <li className="age">나이: {age}</li>
          <li className="like-count">
            <strong>좋아요: </strong>
            <span>{likeCounts}</span>
          </li>
        </ul>
        <button id="btnOldBoy" type="button" onClick={handleClick}>
          올드 보이 변신!
        </button>
        <button id="btnLike" type="button" onClick={handleLikeClick(1)}>
          좋아요
        </button>
        <button id="btnDislike" type="button" onClick={handleLikeClick(-1)}>
          시러요
        </button>
        <button id="btnToSonic" type="button" onClick={handleToSonic}>
          소닉으로 변신!
        </button>
      </>
    );
  };
  const TestWithCtx = ctx.withCtx(TestContainer);
  let mountTarget: ReturnType<typeof mount>;

  const initState = getInitCtxState();
  const cases: Array<[string, CtxState]> = [
    [
      '#btnOldBoy',
      {
        ...initState,
        age: 41,
      },
    ],
    [
      '#btnLike',
      {
        ...initState,
        age: 41,
        likeCounts: initState.likeCounts + 1,
      },
    ],
    [
      '#btnLike',
      {
        ...initState,
        age: 41,
        likeCounts: initState.likeCounts + 2,
      },
    ],
    [
      '#btnDislike',
      {
        ...initState,
        age: 41,
        likeCounts: initState.likeCounts + 1,
      },
    ],
    [
      '#btnToSonic',
      {
        ...initState,
        age: 12,
        likeCounts: initState.likeCounts + 1,
        name: '쏘닉',
      },
    ],
  ];

  beforeEach(() => {
    mountTarget = mount(<TestWithCtx />) as ReturnType<typeof mount>;
  });

  afterEach(() => {
    if (mountTarget) {
      mountTarget.unmount();
    }
  });

  it('한 곳씩 순차적으로 dispatch 하여도 실행 순서를 지켜 의도대로 상태가 변경된다.', () => {
    function test(btnSelector: string, expectValue: CtxState) {
      const childTrigger = mountTarget.find(btnSelector);

      childTrigger.simulate('click', {});

      const childName = mountTarget.find('.name');
      const childAge = mountTarget.find('.age');
      const childLike = mountTarget.find('.like-count');

      expect(childName.prop('children')).toEqual(['이름: ', expectValue.name]);
      expect(childAge.prop('children')).toEqual(['나이: ', expectValue.age]);
      expect(childLike.find('span').prop('children')).toEqual(
        expectValue.likeCounts,
      );
    }

    cases.forEach((args) => test(...args));
  });

  it('여러곳에서 dispatch 가 연속으로 이뤄져도 의도대로 상태가 변경되어 있다.', () => {
    cases.forEach((args) => mountTarget.find(args[0]).simulate('click', {}));

    const childName = mountTarget.find('.name');
    const childAge = mountTarget.find('.age');
    const childLike = mountTarget.find('.like-count');

    const expectValue = cases[cases.length - 1][1];
    expect(childName.prop('children')).toEqual(['이름: ', expectValue.name]);
    expect(childAge.prop('children')).toEqual(['나이: ', expectValue.age]);
    expect(childLike.find('span').prop('children')).toEqual(
      expectValue.likeCounts,
    );
  });
});
