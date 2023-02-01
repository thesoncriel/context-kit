# Context Kit

React 의 Context API 를 이용하여 비동기 side-effect 처리기와 상태 관리기를 함께 사용할 수 있도록 보조하는 라이브러리 입니다.

본 라이브러리는 [TypeScript](https://www.typescriptlang.org)를 기반으로 작성되어 있으므로 React 와 TypeScript 를 함께 운용하는 프로젝트에서 사용을 권장 합니다.

## 설치

아래와 같이 npm 을 이용하여 간단하게 설치 가능 합니다.

```sh
npm i context-kit
```

## 사용

기본적으로 제공되는 **contextInjector** 를 이용합니다.

이 때 작성해야 할 것은 아래와 같습니다.

- 초기 상태값
- 비동기 액션을 처리 할 **워커(worker)**
- **withCtx** 로 감싸진 컨테이너 컴포넌트(Container Component)

> 이하 컨테이너 컴포넌트의 용도는 Flux Architecture 를 사용할 때의 용도와 같음을 미리 언급 합니다.

### 예제

open api 를 통해 포스팅 목록을 불러오는 예제입니다.

- Demo API 출처: [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com/)

```tsx
import React from 'react';
import { contextInjector } from 'context-kit';

// 컨텍스트에서 사용될 상태 모델 선언
interface State {
  list: string[];
  loading: boolean;
}

const ctx = contextInjector(
  // 초기 상태값 정의
  { list: [], loading: false } as State,
  // 비동기 액션을 처리 할 워커 선언
  (dispatch) => ({
    async loadList() {
      dispatch({ loading: true });

      try {
        const list = await fetch('https://jsonplaceholder.typicode.com/posts')
          .then((res) => res.json())
          .then((list) => list.map((item: { title: string }) => item.title));

        dispatch({
          loading: false,
          list,
        });
      } catch (error) {
        dispatch({
          loading: false,
        });
        // error handling
        alert(error.message);
      }
    },
  }),
);

export const SampleContainer = ctx.withCtx(() => {
  // 컨텍스트에서 자료 가져오기
  const { list, loading } = ctx.useSelectorAll();
  // 워커 호출
  const worker = ctx.useWorker();

  const handleClick = () => {
    // 워커의 액션 수행
    worker.loadList();
  };

  if (loading) {
    return <span>loading...</span>;
  }

  if (list.length === 0) {
    return (
      <button type="button" onClick={handleClick}>
        Click to Load Posts
      </button>
    );
  }

  return (
    <section>
      <h2>Posts</h2>
      <ul>
        {list.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </section>
  );
});
```

```tsx
// 작성된 컨테이너 사용

import React from 'react';
import { SampleContainer } from './SampleContainer';

function App() {
  return <SampleContainer />;
}

export default App;
```

## API

Context Kit 에서 제공되는 전체 내용은 다음과 같습니다.

### contextInjector

초기상태와 워커를 묶어서 컨텍스트 기반의 상태 관리자를 만듭니다.

기본적인 사용 예제는 다음과 같습니다.

```ts
import { contextInjector } from 'context-kit';

const ctx = contextInjector(
  // 초기 상태값(객체) 지정.
  {
    value1: 0,
    value2: 'theson',
    /* ... */
  },
  // 워커(Worker) 지정.
  // 워커는 메서드가 담긴 객체를 만드는 팩토리(factory) 함수 입니다.
  (dispatch, getState)) => ({
    // 비동기로 자료를 가져온다면 async~await 로 작성 합니다.
    async loadData() {
      const value1 = await fetch('https://api.some-url.com')
        .then(res => res.json())
        .then(data => data.someInteger);
    },
    // 비동기가 아니라면 일반 함수로 작성해도 무방합니다.
    changeInput(value: string) {
      dispatch({ value2: value });
    },
    /* ... */
  }),
);
```

#### Worker

워커는 비동기 액션(Asynchronize action)이 메서드로 담긴 객체(Object) 입니다.

워커 선언 시 해당 함수에 인자(arguments)가 2개를 받을 수 있으며 그 내용은 다음과 같습니다.

| seq | name     | description                                                                                                                                                                |
| :-- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | dispatch | 상태값을 변경하는 디스패처(dispatcher) 입니다.<br/>수행 시 내부에서 전체 상태값에 대하여 얕은 복사(Shallow Copy)를 하기 때문에<br/>필요한 필드만 지정하여 바꿔주면 됩니다. |
| 2   | getState | 현재 상태값을 가져옵니다.                                                                                                                                                  |

#### Context Injector Result (CIR)

초기값과 워커를 이용하여 contextInjector 를 수행하면 결과 객체인 CIR이 생성 됩니다.

CIR 은 다음과 같은 메서드를 가집니다.

| name           | type     | args         | returns       | place of use             | description                                                                                                                                                                                                                                   |
| :------------- | :------- | :----------- | :------------ | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| withCtx        | HOC      | Component    | Component     | 컨테이너 컴포넌트 감싸기 | 만들어진 컨텍스트를 특정 컴포넌트에 적용 합니다.<br />내부적으로 `Context.Provider` 를 이용하여 적용 됩니다.                                                                                                                                  |
| useSelectorAll | hooks    |              | State Object  | 컨테이너 컴포넌트        | 컨텍스트의 상태값을 모두 가져옵니다.                                                                                                                                                                                                          |
| useSelector    | hooks    | function     | Any Values    | 컨테이너 컴포넌트        | 컨텍스트의 상태값에서 일부를 추출하여 가져 옵니다.<br />[react-redux](https://redux.js.org/basics/usage-with-react) 의 [useSelector](https://redux.js.org/recipes/usage-with-typescript#typing-the-useselector-hook) 와 사용 방법이 같습니다. |
| useDispatch    | hooks    | State Object |               | 컨테이너 컴포넌트        | 컨텍스트의 상태값을 변경합니다.<br />가급적 디스패치는 워커에서 하길 권장합니다.                                                                                                                                                              |
| useWorker      | hooks    |              | Worker Object | 컨테이너 컴포넌트        | 지정된 워커 객체를 가져옵니다.                                                                                                                                                                                                                |
| clone          | function |              | **CIR**       | 컴포넌트 바깥            | CIR 을 복사 합니다.<br />같은 컨텍스트를 동시에 다른 곳에서 쓰되<br/>별도 상태를 유지해야 할 경우 사용 하십시요.<br />(일반적으론 쓸 일이 없습니다.)                                                                                          |

### Utility

아래와 같이 contextInjector 사용을 보조하는 유틸리티 함수가 포함되어 있습니다.

#### compose

compose 는 여러개의 CIR 을 묶어서 하나의 **Container Component** 에 HOC 로 쓰일 수 있습니다.

아래는 사용 예시 입니다.

```tsx
import React from 'react';
import { contextInjector, compose } from 'context-kit';

const ctx1 = contextInjector({ age: 10 }, (dispatch, getState) => ({
  addAge(age: number) {
    dispatch({
      age: getState().age + age,
    });
  },
}));

const ctx2 = contextInjector({ name: '' }, (dispatch, getState) => ({
  appendName(name: string) {
    dispatch({
      name: getState().name + name,
    });
  },
}));

const Container: React.FC = () => {
  // codes...
};

// 2개의 컨텍스트가 결합되어 사용 가능해진 컨테이너
const ResultContainer = compose(ctx1, ctx2)(Container);
```

> 이렇게 유틸리티를 별도 제공하나 Container 와 Context 는 가급적 1:1 관계가 되도록 설계하여 작성하시길 권장합니다.

## 사용 시 주의

Context API 는 그 특성상 같은 화면 내 다른 곳에서 중복되어 선언되어 사용될 수 없습니다.

때문에 만들어진 **CIR** 의 `withCtx` HOC 는 단 1곳에서만 사용되어야 합니다.

만약 같은 화면 내 다른 여러곳에서 `withCtx` 를 남발하면, 마지막에 적용된 **Container Component** 에서만 상태값이 올바르게 동작 할 것입니다.

## 여담

만약 여러 페이지에서 상태가 유지되어야 한다면 [redux](https://redux.js.org/)를 사용하길 권장 드립니다.

redux 는 세계적으로 널리 쓰이는 Flux Architecture 기반의 상태 관리자 라이브러리 이며, 강력한 middleware 가 탑재되어 있으므로 side-effect 처리에도 탁월 합니다.

**Context Kit** 은 국소적인 영역의 상태 관리자가 필요할 때만 사용하세요!

참고로 작성자 본인도 redux 애호가 입니다. 😊


## TODO

- [x] npm 에 올려보기
- [x] 기존 템플릿 라이브러리에 적용 시켜보기
- [x] ci 와 github 연동하여 test 및 라이브러리 배포 자동화
- [x] API 문서 보강
- [ ] 테스트 페이지 만들어서 링크 하기
- [ ] createWorker 만들기
