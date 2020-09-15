import React, { Dispatch, FC, useEffect } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';

import { contextInjector } from './contextInjector';
import { timeout } from '../../util';

interface TestCompProps {
  name: string;
  age: number;
  likeCounts: number;
}

const TestComp: FC<TestCompProps> = ({ name, age, likeCounts }) => {
  return (
    <ul>
      <li>name: {name}</li>
      <li>age: {age}</li>
      <li>likeCounts: {likeCounts}</li>
    </ul>
  );
};

interface CtxState extends TestCompProps {
  loading: boolean;
}

function getInitCtxState(): CtxState {
  return {
    age: 29,
    likeCounts: 30000,
    loading: false,
    name: '쏜쌤',
  };
}

interface TestQuery {
  keyword?: string;
  type?: string;
}

interface InterTestState {
  value: number;
  items: TestCompProps[];
  query?: TestQuery;
  loading: boolean;
}

function getInitInterTestState(): InterTestState {
  return {
    items: [],
    loading: false,
    query: {},
    value: 100,
  };
}
const sampleList: TestCompProps[] = [
  {
    age: 12,
    likeCounts: 1000,
    name: '소닉-변경전',
  },
  {
    age: 11,
    likeCounts: 1004,
    name: '테일즈-변경전',
  },
  {
    age: 13,
    likeCounts: 999,
    name: '너클즈-변경전',
  },
];

const sampleApi = {
  loadHeroes() {
    return timeout(300, { items: [...sampleList] });
  },
  plusValue(src: number, plusValue: number) {
    if (plusValue <= 0) {
      throw new Error('plusValue must greater then zero');
    }
    return timeout(150, src + plusValue);
  },
};

const sampleInteractor = (
  state: () => InterTestState,
  dispatch: Dispatch<Partial<InterTestState>>,
) => ({
  async loadHeroes() {
    try {
      dispatch({
        loading: true,
      });

      const { items } = await sampleApi.loadHeroes();

      dispatch({
        items,
        loading: false,
      });
    } catch (error) {
      dispatch({
        loading: false,
      });
    }
  },
  noAsync(query: TestQuery) {
    dispatch({
      query: { ...state().query, ...query },
    });
  },
  async plusValue(plusValue: number) {
    try {
      const value = await sampleApi.plusValue(state().value, plusValue);

      dispatch({
        value,
      });
    } catch (error) {
      dispatch({
        value: -1,
      });
    }
  },
  updateHero(index: number, item: TestCompProps) {
    const items = state().items.concat([]);

    items[index] = { ...item };

    dispatch({
      items,
    });
  },
});

const ctxSample = contextInjector(getInitInterTestState(), sampleInteractor);

const HeroItem: FC<TestCompProps> = props => {
  return <li>{getHeroItemStr(props)}</li>;
};

interface IdProps {
  id: string;
}

interface HeroListProps extends IdProps {
  items: TestCompProps[];
}

const HeroList: FC<HeroListProps> = ({ id, items }) => {
  return (
    <ul className="hero-list" id={id}>
      {items.map((item, idx) => (
        <HeroItem key={`${id}${idx}`} {...item} />
      ))}
    </ul>
  );
};

interface ValuePrintProps extends IdProps {
  value: number;
}

const ValuePrint: FC<ValuePrintProps> = ({ id, value }) => {
  return (
    <div className="value-print" id={id}>
      {value}
    </div>
  );
};

interface HeroUpateArgs {
  index: number;
  item: TestCompProps;
}

interface HeroesContainerProps extends IdProps {
  onUpdateGetter?: () => HeroUpateArgs;
}

const HeroesContainer: FC<HeroesContainerProps> = ({
  id,
  onUpdateGetter,
  children,
}) => {
  const state = ctxSample.useCtxSelectorAll();
  const inter = ctxSample.useInteractor();

  const handleLoad = () => {
    void inter.loadHeroes();
  };
  const handleUpdate = () => {
    if (!onUpdateGetter) {
      return;
    }
    const { index, item } = onUpdateGetter();

    inter.updateHero(index, item);
  };

  return (
    <div>
      <HeroList id={id} items={state.items} />
      <button id={`btn${id}_load`} type="button" onClick={handleLoad}>
        불러오기
      </button>
      <button id={`btn${id}_update`} type="button" onClick={handleUpdate}>
        업데이트
      </button>
      {children}
    </div>
  );
};

const ValueContainer: FC<IdProps> = ({ id, children }) => {
  const state = ctxSample.useCtxSelectorAll();
  const inter = ctxSample.useInteractor();

  const handleValue = () => {
    if (state.value > 10) {
      void inter.plusValue(-1);
    } else {
      void inter.plusValue(3);
    }
  };

  return (
    <>
      <ValuePrint id={id} value={state.value} />
      <button id={`btn${id}_value`} type="button" onClick={handleValue}>
        3 더하기 고고씽
      </button>
      {children}
    </>
  );
};

function getSelector(id: string, type: 'load' | 'update' | 'value') {
  return `#btn${id}_${type}`;
}
function getHeroItemStr(item: TestCompProps) {
  return `${item.name}:${item.age}:${item.likeCounts}`;
}

Enzyme.configure({ adapter: new Adapter() });

describe('context injector', () => {
  describe('기본 기능', () => {
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
      expect(childResult.prop('children')).toEqual([
        '나는 ',
        '아직 청년 ^.^)v',
      ]);

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
  describe('멀티 디스패치', () => {
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

        expect(childName.prop('children')).toEqual([
          '이름: ',
          expectValue.name,
        ]);
        expect(childAge.prop('children')).toEqual(['나이: ', expectValue.age]);
        expect(childLike.find('span').prop('children')).toEqual(
          expectValue.likeCounts,
        );
      }

      cases.forEach(args => test(...args));
    });

    it('여러곳에서 dispatch 가 연속으로 이뤄져도 의도대로 상태가 변경되어 있다.', () => {
      cases.forEach(args => mountTarget.find(args[0]).simulate('click', {}));

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

  describe('interactor 기본 테스트', () => {
    it('interactor 를 이용하여 자료를 로드 하면 전체 요소에 반영된다.', async done => {
      const ID = 'heroes';
      const TestContainer = ctxSample.withCtx(HeroesContainer);

      let mountTarget = mount(<TestContainer id={ID} />, {
        context: getInitCtxState(),
      });

      await act(async () => {
        mountTarget.find(getSelector(ID, 'load')).simulate('click', {});

        await timeout(400);
      });

      mountTarget = mountTarget.mount();

      expect(mountTarget.find(HeroList).find(HeroItem)).toHaveLength(3);

      mountTarget
        .find(HeroList)
        .find(HeroItem)
        .forEach((child, idx) => {
          expect(child.text()).toEqual(getHeroItemStr(sampleList[idx]));
        });

      mountTarget.unmount();

      done();
    });

    it('interactor 를 이용하여 자료를 변경 하면 반영된다.', async done => {
      const ID = 'heroes';
      const mockItem = {
        age: 29,
        likeCounts: 5000,
        name: '쏜쌤',
      };
      const TestContainer = ctxSample.withCtx(HeroesContainer);
      let mountTarget = mount(
        <TestContainer
          id={ID}
          onUpdateGetter={() => ({
            index: 1,
            item: mockItem,
          })}
        />,
      );

      await act(async () => {
        mountTarget.find(getSelector(ID, 'load')).simulate('click', {});

        await timeout(350);

        mountTarget.find(getSelector(ID, 'update')).simulate('click', {});
      });

      mountTarget = mountTarget.mount();

      const heroItems = mountTarget.find(HeroList).find(HeroItem);

      expect(heroItems.at(0).text()).toEqual(getHeroItemStr(sampleList[0]));
      expect(heroItems.at(1).text()).toEqual(getHeroItemStr(mockItem));
      expect(heroItems.at(2).text()).toEqual(getHeroItemStr(sampleList[2]));

      mountTarget.unmount();

      done();
    });

    it('interactor 가 동기적 함수여도 제대로 수행된다.', async done => {
      const interTest = (
        getState: () => InterTestState,
        dispatch: (state: Partial<InterTestState>) => void,
      ) => ({
        noAsync(query: TestQuery) {
          dispatch({
            query: {
              ...getState().query,
              ...query,
            },
          });
        },
      });
      const ctx = contextInjector(getInitInterTestState(), interTest);
      const TestComponent: FC = () => {
        const { query } = ctx.useCtxSelectorAll();
        const inter = ctx.useInteractor();

        useEffect(() => {
          inter.noAsync({ keyword: 'style', type: 'share' });
        }, [inter]);

        return (
          <div>
            <div className="keyword">{query && query.keyword}</div>
            <div className="type">{query && query.type}</div>
          </div>
        );
      };
      const TestContainer = ctx.withCtx(TestComponent);

      let mountTarget: ReturnType<typeof mount>;

      await act(async () => {
        mountTarget = mount(<TestContainer />) as ReturnType<typeof mount>;
        mountTarget = mountTarget.mount();

        await timeout(100);

        expect(mountTarget.find('.keyword').prop('children')).toEqual('style');
        expect(mountTarget.find('.type').prop('children')).toEqual('share');

        mountTarget.unmount();
      });

      done();
    });
  });

  describe('interactor 스트레스 테스트', () => {
    const ID = 'heroes';
    const ID2 = 'theson';
    const ID3 = 'google';
    const ID4 = 'kakao';
    const mockItems: TestCompProps[] = [
      {
        age: 50,
        likeCounts: 0,
        name: '닥터에그만-after',
      },
      {
        age: 20,
        likeCounts: 20,
        name: '블레이즈-after',
      },
      {
        age: 29,
        likeCounts: 5000,
        name: '쏜쌤-after',
      },
    ];
    const otherMockItem = {
      ...mockItems[1],
      name: '복털이-after!!',
    };
    let index = 0;

    const handleUpdateGetter = () => {
      const ret = {
        index: index,
        item: mockItems[index],
      };

      index++;
      // 4번째는 다른 아이템을 추가로 넣어준다.
      if (index > 3) {
        index = 0;

        ret.item = otherMockItem;
      }

      return ret;
    };

    const TestContainer = ctxSample.withCtx(() => {
      return (
        <HeroesContainer id={ID} onUpdateGetter={handleUpdateGetter}>
          <ValueContainer id={ID2}>
            <HeroesContainer id={ID3} onUpdateGetter={handleUpdateGetter} />
            <ValueContainer id={ID4} />
          </ValueContainer>
        </HeroesContainer>
      );
    });

    let mountTarget: ReturnType<typeof mount>;
    // eslint-disable-next-line no-console
    const originalConsoleWran = console.warn;
    // eslint-disable-next-line no-console
    const originalConsoleLog = console.log;
    const mockLog = jest.fn();
    const mockWarn = jest.fn();

    beforeEach(() => {
      mountTarget = mount(<TestContainer />) as ReturnType<typeof mount>;
      // eslint-disable-next-line no-console
      console.log = mockLog;
      // eslint-disable-next-line no-console
      console.warn = mockWarn;
    });
    afterEach(() => {
      if (mountTarget && mountTarget.length > 0) {
        mountTarget.unmount();
      }
      // eslint-disable-next-line no-console
      console.log = originalConsoleLog;
      // eslint-disable-next-line no-console
      console.warn = originalConsoleWran;

      mockLog.mockRestore();
      mockWarn.mockRestore();
    });

    it('업데이트를 연속 4번 했을 때 의도대로 변경 된다.', async done => {
      let target = mountTarget;

      await act(async () => {
        target.find(getSelector(ID, 'load')).simulate('click', {});

        await timeout(350);

        // 첫 수정
        target.find(getSelector(ID, 'update')).simulate('click', {});
        // 두번째 수정
        target.find(getSelector(ID3, 'update')).simulate('click', {});

        await timeout(50);

        // 세번째 수정
        target.find(getSelector(ID, 'update')).simulate('click', {});

        // 네번째 수정
        target.find(getSelector(ID3, 'update')).simulate('click', {});
      });

      target = target.mount();

      const heroItems1 = target.find(`#${ID}`).find(HeroItem);
      const heroItems2 = target.find(`#${ID3}`).find(HeroItem);

      expect(heroItems1.at(0).text()).toEqual(getHeroItemStr(mockItems[0]));
      expect(heroItems1.at(1).text()).toEqual(getHeroItemStr(mockItems[1]));
      expect(heroItems1.at(2).text()).toEqual(getHeroItemStr(mockItems[2]));
      expect(heroItems1.at(3).text()).toEqual(getHeroItemStr(otherMockItem));

      expect(heroItems2.at(0).text()).toEqual(getHeroItemStr(mockItems[0]));
      expect(heroItems2.at(1).text()).toEqual(getHeroItemStr(mockItems[1]));
      expect(heroItems2.at(2).text()).toEqual(getHeroItemStr(mockItems[2]));
      expect(heroItems2.at(3).text()).toEqual(getHeroItemStr(otherMockItem));

      target.unmount();

      done();
    });

    it('종류가 다른 업데이트를 여러번 하여도 의도대로 변경 된다.', async done => {
      let target = mountTarget;

      await act(async () => {
        target.find(getSelector(ID, 'load')).simulate('click', {});

        await timeout(350);

        target.find(getSelector(ID2, 'value')).simulate('click', {});
        // -> 3
        target.find(getSelector(ID3, 'update')).simulate('click', {});
        target.find(getSelector(ID4, 'value')).simulate('click', {});
        // -> 6
        target.find(getSelector(ID3, 'load')).simulate('click', {});
        // -> await 를 안했기 때문에 반영 안된다.

        target.find(getSelector(ID4, 'value')).simulate('click', {});
        // -> 9
        target.find(getSelector(ID2, 'value')).simulate('click', {});
        // -> -1 ---- 10을 넘어가면 -1 을 주고 exception 을 일으켜 -1 로 바뀜
        target.find(getSelector(ID, 'update')).simulate('click', {});
        // -> 히어로 목록에서 2번째 내용까지 변경 된다.
      });

      target = target.mount();

      let heroItems1 = target.find(`#${ID}`).find(HeroItem);
      let heroItems2 = target.find(`#${ID3}`).find(HeroItem);
      const valueCont1 = target.find(`#${ID2}`).find(ValuePrint);
      const valueCont2 = target.find(`#${ID4}`).find(ValuePrint);

      expect(heroItems1.at(0).text()).toEqual(getHeroItemStr(mockItems[0]));
      expect(heroItems1.at(1).text()).toEqual(getHeroItemStr(mockItems[1]));
      expect(heroItems1.at(2).text()).toEqual(getHeroItemStr(sampleList[2]));

      expect(heroItems2.at(0).text()).toEqual(getHeroItemStr(mockItems[0]));
      expect(heroItems2.at(1).text()).toEqual(getHeroItemStr(mockItems[1]));
      expect(heroItems2.at(2).text()).toEqual(getHeroItemStr(sampleList[2]));

      expect(
        valueCont1
          .find('div')
          .at(0)
          .text(),
      ).toEqual('-1');
      expect(
        valueCont2
          .find('div')
          .at(0)
          .text(),
      ).toEqual('-1');

      await act(async () => {
        await timeout(400);
        target = target.mount();
      });

      heroItems1 = target.find(`#${ID}`).find(HeroItem);
      heroItems2 = target.find(`#${ID3}`).find(HeroItem);

      expect(heroItems1.at(0).text()).toEqual(getHeroItemStr(sampleList[0]));
      expect(heroItems1.at(1).text()).toEqual(getHeroItemStr(sampleList[1]));
      expect(heroItems1.at(2).text()).toEqual(getHeroItemStr(sampleList[2]));

      expect(heroItems2.at(0).text()).toEqual(getHeroItemStr(sampleList[0]));
      expect(heroItems2.at(1).text()).toEqual(getHeroItemStr(sampleList[1]));
      expect(heroItems2.at(2).text()).toEqual(getHeroItemStr(sampleList[2]));

      target.unmount();

      done();
    });

    it('unmount 후 dispatch 명령은 무시된다.', async done => {
      let target = mountTarget;

      await act(async () => {
        target.find(getSelector(ID, 'load')).simulate('click', {});

        await timeout(50);

        target = target.mount();
      });

      expect(target.find(`#${ID}`).find(HeroItem)).toHaveLength(0);

      target.unmount();

      jest.mock('console');

      const spy = jest.spyOn(console, 'log');

      await act(async () => {
        await timeout(400);
      });

      expect(spy).toBeCalled();
      expect(spy).lastCalledWith('canceled');

      spy.mockRestore();

      done();
    });

    it('provider 를 여러번 쓸 경우 경고를 띄운다.', async done => {
      const spy = jest.spyOn(console, 'warn');
      const ctx = contextInjector(getInitCtxState(), () => ({}));
      const Container1 = ctx.withCtx(HeroesContainer);
      const Container2 = ctx.withCtx(ValueContainer);
      const Container3 = ctx.withCtx(HeroesContainer);

      const target1 = mount(<Container1 id="s1" />);
      const target2 = mount(<Container2 id="s2" />);
      const target3 = mount(<Container3 id="s3" />);

      await timeout(100);

      expect(spy).toBeCalledTimes(2);
      expect(spy).toBeCalledWith('Context is aleady used!');

      target1.unmount();
      target2.unmount();
      target3.unmount();

      spy.mockRestore();

      done();
    });

    it('context 를 사용치 않는데 interactor 를 호출하면 경고를 띄운다.', async done => {
      const spy = jest.spyOn(console, 'warn');
      const ctx = contextInjector(
        getInitCtxState(),
        (
          getState: () => CtxState,
          dispatch: (state: Partial<CtxState>) => void,
        ) => ({
          setLoading(loading: boolean) {
            dispatch({
              ...getState(),
              loading,
            });
          },
        }),
      );

      // const Container1 = ctx.withCtx(HeroesContainer);
      const TestContainer: FC = () => {
        const { loading } = ctx.useCtxSelectorAll();
        const inter = ctx.useInteractor();

        useEffect(() => {
          inter.setLoading(!loading);
        }, [inter]);

        return <div>{loading}</div>;
      };

      await act(async () => {
        let mountTarget = mount(<TestContainer />) as ReturnType<typeof mount>;
        mountTarget = mountTarget.mount();

        await timeout(100);

        expect(spy).toHaveBeenCalledWith(
          'context is not wrapped. - state hint:',
          getInitCtxState(),
        );

        mountTarget.unmount();
      });

      spy.mockReset();

      const CtxContainer = ctx.withCtx(TestContainer);

      await act(async () => {
        let mountTarget = mount(<CtxContainer />) as ReturnType<typeof mount>;
        mountTarget = mountTarget.mount();

        await timeout(100);

        expect(spy).not.toHaveBeenCalled();

        mountTarget.unmount();
      });

      done();
    });
  });
});
