import React, { FC, useEffect } from 'react';
import Enzyme, { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import Adapter from 'enzyme-adapter-react-16';
import contextInjector from 'context-kit';
import {
  ctxSample,
  CtxState,
  getHeroItemStr,
  getInitCtxState,
  getSelector,
  HeroesContainer,
  HeroItem,
  sampleList,
  TestCompProps,
  ValueContainer,
  ValuePrint,
} from './test-materials';
import { timeout } from '../util';

Enzyme.configure({ adapter: new Adapter() });

describe('interactor - 스트레스 테스트', () => {
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

  it('업데이트를 연속 4번 했을 때 의도대로 변경 된다.', async (done) => {
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

  it('종류가 다른 업데이트를 여러번 하여도 의도대로 변경 된다.', async (done) => {
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

    expect(valueCont1.find('div').at(0).text()).toEqual('-1');
    expect(valueCont2.find('div').at(0).text()).toEqual('-1');

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

  it('unmount 후 dispatch 명령은 무시된다.', async (done) => {
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

  it('provider 를 여러번 쓸 경우 경고를 띄운다.', async (done) => {
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

  it('context 를 사용치 않는데 interactor 를 호출하면 경고를 띄운다.', async (done) => {
    const spy = jest.spyOn(console, 'warn');
    const ctx = contextInjector(
      getInitCtxState(),
      (
        dispatch: (state: Partial<CtxState>) => void,
        getState: () => CtxState,
      ) => ({
        setLoading(loading: boolean) {
          dispatch({
            ...getState(),
            loading,
          });
        },
      }),
    );

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
