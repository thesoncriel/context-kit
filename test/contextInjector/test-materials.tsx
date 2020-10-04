/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { FC, Dispatch } from 'react';
import { timeout } from '../util';
import contextInjector from 'context-kit';

export interface TestCompProps {
  name: string;
  age: number;
  likeCounts: number;
}

export const TestComp: FC<TestCompProps> = ({ name, age, likeCounts }) => {
  return (
    <ul>
      <li>name: {name}</li>
      <li>age: {age}</li>
      <li>likeCounts: {likeCounts}</li>
    </ul>
  );
};

export interface CtxState extends TestCompProps {
  loading: boolean;
}

export function getInitCtxState(): CtxState {
  return {
    age: 29,
    likeCounts: 30000,
    loading: false,
    name: '쏜쌤',
  };
}

export interface TestQuery {
  keyword?: string;
  type?: string;
}

export interface InterTestState {
  value: number;
  items: TestCompProps[];
  query?: TestQuery;
  loading: boolean;
}

export function getInitInterTestState(): InterTestState {
  return {
    items: [],
    loading: false,
    query: {},
    value: 100,
  };
}
export const sampleList: TestCompProps[] = [
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

export const sampleApi = {
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

export const sampleInteractor = (
  dispatch: Dispatch<Partial<InterTestState>>,
  state: () => InterTestState,
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

export const ctxSample = contextInjector(
  getInitInterTestState(),
  sampleInteractor,
);

export const HeroItem: FC<TestCompProps> = (props) => {
  return <li>{getHeroItemStr(props)}</li>;
};

export interface IdProps {
  id: string;
}

export interface HeroListProps extends IdProps {
  items: TestCompProps[];
}

export const HeroList: FC<HeroListProps> = ({ id, items }) => {
  return (
    <ul className="hero-list" id={id}>
      {items.map((item, idx) => (
        <HeroItem key={`${id}${idx}`} {...item} />
      ))}
    </ul>
  );
};

export interface ValuePrintProps extends IdProps {
  value: number;
}

export const ValuePrint: FC<ValuePrintProps> = ({ id, value }) => {
  return (
    <div className="value-print" id={id}>
      {value}
    </div>
  );
};

export interface HeroUpateArgs {
  index: number;
  item: TestCompProps;
}

export interface HeroesContainerProps extends IdProps {
  onUpdateGetter?: () => HeroUpateArgs;
}

export const HeroesContainer: FC<HeroesContainerProps> = ({
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

export const ValueContainer: FC<IdProps> = ({ id, children }) => {
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

export function getSelector(id: string, type: 'load' | 'update' | 'value') {
  return `#btn${id}_${type}`;
}
export function getHeroItemStr(item: TestCompProps) {
  return `${item.name}:${item.age}:${item.likeCounts}`;
}
