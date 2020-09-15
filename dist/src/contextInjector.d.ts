import { ContextInjectorResult, ContextInteractor } from './models';
/**
 * 상태 관리에 이용할 컨텍스트와 이를 이용하기 위한 각종 컴포넌트와 훅(hooks)을 만들어서 제공한다.
 *
 * 필요한 상태값 및 중간 처리기인 인터렉터(interactor) 를 구현해서 주입(inject) 해 주어야 한다.
 * @param initState 초기 상태값
 * @param interactor 상태에 대한 액션과 변경 및 dispatch 를 수행하는 이펙트 함수가 모여진 객체 ...를 만들어주는 함수.
 */
export declare function contextInjector<T, IT>(initState: T, interactor: ContextInteractor<T, IT>): ContextInjectorResult<T, IT>;
