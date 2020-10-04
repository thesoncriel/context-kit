import React, { ComponentType, FC, useEffect } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';

import { contextInjector, compose } from 'context-kit';
import { timeout } from './util';

Enzyme.configure({ adapter: new Adapter() });

describe('compose', () => {
  interface Props0 {
    title: string;
  }
  interface Props1 {
    name: string;
  }
  interface Props2 {
    age: number;
  }
  let callSeq: number[] = [];
  function with0<P extends Props0>(Comp: ComponentType<P>) {
    callSeq.push(0);
    const ReturnComp: FC<P> = (props) => {
      return <Comp {...props} title={`제목: ${props.title}`} />;
    };

    return ReturnComp;
  }
  function with1<P extends Props1>(Comp: ComponentType<P>) {
    callSeq.push(1);
    const ReturnComp: FC<P> = (props) => {
      return <Comp {...props} name={`이름: ${props.name}`} />;
    };

    return ReturnComp;
  }
  function with2<P extends Props2>(Comp: ComponentType<P>) {
    callSeq.push(2);
    const ReturnComp: FC<P> = (props) => {
      return <Comp {...props} age={props.age - 1} />;
    };

    return ReturnComp;
  }

  interface TestProps extends Props0, Props1, Props2 {
    value: string;
  }
  const TestComp: FC<TestProps> = ({ title, name, age, value }) => {
    return (
      <ul>
        <li>{title}</li>
        <li>{name}</li>
        <li>{age}</li>
        <li>{value}</li>
      </ul>
    );
  };

  describe('여러개의 HOC 를 묶어서 하나의 HOC 로 만들어 쓸 수 있다.', () => {
    const mockProps = {
      age: 30,
      name: '쏜쌤',
      title: '스쉐다',
      value: '673',
    };

    afterEach(() => {
      callSeq = [];
    });

    it('HOC를 통해 변경된 값이 의도한 것과 같다.', () => {
      const withEnhanced = compose(with0, with1, with2);
      const EnhancedComp = withEnhanced(TestComp);
      const mountTarget = mount(<EnhancedComp {...mockProps} />);
      const expectValues = [
        `제목: ${mockProps.title}`,
        `이름: ${mockProps.name}`,
        mockProps.age - 1,
        mockProps.value,
      ];

      expectValues.forEach((expectValue, idx) => {
        expect(mountTarget.find('li').at(idx).prop('children')).toBe(
          expectValue,
        );
      });

      mountTarget.unmount();
    });
    it('compose 에 등록된 HOC 는 역순으로 수행된다.', () => {
      const withEnhanced = compose(with0, with1, with2);
      const EnhancedComp = withEnhanced(TestComp);
      const mountTarget = mount(<EnhancedComp {...mockProps} />);

      expect(callSeq).toEqual([2, 1, 0]);

      mountTarget.unmount();
    });
  });

  function getInitTestProps(): TestProps {
    return {
      age: 25,
      name: '쏜쌤',
      title: '스쉐랑께',
      value: '2017',
    };
  }

  const ctx0 = contextInjector(getInitTestProps(), (dispatch, getState) => ({
    addAge(value: number) {
      dispatch({
        age: getState().age + value,
      });
    },
  }));

  interface TestProps1 {
    boba: string;
    chungmung: string;
    leo: string;
    dahye: string;
    hwang: boolean;
  }

  function getInitTestProps1(): TestProps1 {
    return {
      boba: '보바',
      chungmung: '청멍',
      dahye: '다혜',
      hwang: true,
      leo: '레오',
    };
  }

  const ctx1 = contextInjector(getInitTestProps1(), (dispatch, getState) => ({
    changeLeo(value: number) {
      dispatch({
        leo: `${getState().leo}_${value}`,
      });
    },
  }));

  interface TestProps2 {
    comics: string;
    author: string;
    bookNames: string[];
    salesCount: number;
  }

  function getInitTestProps2(): TestProps2 {
    return {
      author: '이층오',
      bookNames: ['까꿍', '마이러브'],
      comics: '서울 짬뿌',
      salesCount: 1300000,
    };
  }

  async function virtualApiForSalesCount(count: number) {
    return await timeout(200, {
      salesCount: count * 10000,
    });
  }

  const ctx2 = contextInjector(getInitTestProps2(), (dispatch, getState) => ({
    addBookName(name: string) {
      dispatch({
        bookNames: [...getState().bookNames, name],
      });
    },
    async setSalesCount(count: number) {
      const res = await virtualApiForSalesCount(count);

      dispatch({
        salesCount: res.salesCount,
      });
    },
  }));

  interface Props {
    ageValue?: number;
    leoValue?: number;
    bookNameValue?: string;
    salesCountValue?: number;
  }

  const TestComp1: FC<Props> = ({
    ageValue,
    leoValue,
    bookNameValue,
    salesCountValue,
  }) => {
    const { name, age } = ctx0.useSelectorAll();
    const { leo } = ctx1.useSelectorAll();
    const { bookNames, salesCount } = ctx2.useSelectorAll();
    const worker0 = ctx0.useWorker();
    const worker1 = ctx1.useWorker();
    const worker2 = ctx2.useWorker();

    useEffect(() => {
      worker0.addAge(ageValue || 0);
      worker1.changeLeo(leoValue || 0);
      worker2.addBookName(bookNameValue || '');
    }, [worker0, worker1, worker2, ageValue, leoValue, bookNameValue]);

    const handleClick = () => {
      void worker2.setSalesCount(salesCountValue || 1);
    };

    return (
      <section>
        <h2>
          {name} 과 {leo} 는 칭구!
        </h2>
        <h3>나이는 {age} 입니다.</h3>
        <ul>
          {bookNames.map((bookName, idx) => (
            <li key={idx}>{bookName}</li>
          ))}
        </ul>
        <div className="salesCount">
          판매부수: <strong>{salesCount}</strong>
        </div>
        <button className="btn" type="button" onClick={handleClick}>
          조작
        </button>
      </section>
    );
  };

  describe('contextInjector 활용', () => {
    const fnMock0 = jest.spyOn(ctx0, 'withCtx');
    const fnMock1 = jest.spyOn(ctx1, 'withCtx');
    const fnMock2 = jest.spyOn(ctx2, 'withCtx');

    afterEach(() => {
      fnMock0.mockRestore();
      fnMock1.mockRestore();
      fnMock2.mockRestore();
    });

    it('여러개의 컨텍스트를 묶을 경우, 내부의 withCtx 를 자동으로 이용한다.', async (done) => {
      await act(async () => {
        const TestContainer = compose(ctx0, ctx1, ctx2)(TestComp1);
        const mountTarget = mount(<TestContainer />);

        await timeout(100);

        mountTarget.unmount();
      });

      expect(fnMock0).toBeCalled();
      expect(fnMock1).toBeCalled();
      expect(fnMock2).toBeCalled();

      done();
    });

    it('여러개의 컨텍스트를 묶고 각 컨텍스트의 상태값을 바꿨을 때 의도대로 변경된다.', async (done) => {
      await act(async () => {
        const TestContainer = compose(ctx0, ctx1, ctx2)(TestComp1);
        let mountTarget = mount(
          <TestContainer
            ageValue={27}
            bookNameValue="별나라 칭구"
            leoValue={123}
            salesCountValue={300}
          />,
        );

        mountTarget.find('.btn').simulate('click', {});

        await timeout(250);

        mountTarget = mountTarget.mount();

        const elemLi = mountTarget.find('li');

        expect(mountTarget.find('h2').text()).toBe('쏜쌤 과 레오_123 는 칭구!');
        expect(mountTarget.find('h3').text()).toBe(
          `나이는 ${getInitTestProps().age + 27} 입니다.`,
        );

        expect(elemLi.at(0).prop('children')).toBe('까꿍');
        expect(elemLi.at(elemLi.length - 1).prop('children')).toBe(
          '별나라 칭구',
        );

        expect(mountTarget.find('.salesCount > strong').prop('children')).toBe(
          300 * 10000,
        );

        mountTarget.unmount();
      });

      done();
    });
  });
});
