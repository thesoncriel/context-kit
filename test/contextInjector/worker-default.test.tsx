import React, { FC, useEffect } from 'react';
import Enzyme, { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import Adapter from 'enzyme-adapter-react-16';
import { contextInjector } from 'context-kit';
import {
  getInitCtxState,
  ctxSample,
  HeroesContainer,
  getSelector,
  HeroList,
  HeroItem,
  getHeroItemStr,
  sampleList,
  WorkerTestState,
  TestQuery,
  getInitWorkerTestState,
} from './test-materials';
import { timeout } from '../util';

Enzyme.configure({ adapter: new Adapter() });

describe('worker - 기본 테스트', () => {
  it('worker 를 이용하여 자료를 로드 하면 전체 요소에 반영된다.', async (done) => {
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

  it('worker 를 이용하여 자료를 변경 하면 반영된다.', async (done) => {
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

  it('worker 가 동기적 함수여도 제대로 수행된다.', async (done) => {
    const interTest = (
      dispatch: (state: Partial<WorkerTestState>) => void,
      getState: () => WorkerTestState,
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
    const ctx = contextInjector(getInitWorkerTestState(), interTest);
    const TestComponent: FC = () => {
      const { query } = ctx.useSelectorAll();
      const worker = ctx.useWorker();

      useEffect(() => {
        worker.noAsync({ keyword: 'style', type: 'share' });
      }, [worker]);

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
