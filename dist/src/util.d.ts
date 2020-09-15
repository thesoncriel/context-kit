export declare const nop: () => void;
/**
 * 특정 시간이 지난 후 비동기로 특정 값을 전달 한다.
 * @param time 경과 할 시간 (ms)
 * @param value 시간이 지난 후 전달 할 값
 * @param stopCallback 타임아웃 되기 전, 중지 할 수 있는 함수를 넘겨주는 콜백. stop 수행 시 reject 된다.
 */
export declare function timeout<T = void>(time: number, value?: T, stopCallback?: (stop: () => void) => void): Promise<T>;
