import '@testing-library/jest-native/extend-expect';
import { renderHook } from '@testing-library/react-hooks';

import { MVCListScreenControllerGetter } from './controller';

describe('MVCListScreenControllerGetter', () => {
  it('should call onMount when mounting', () => {
    const onMountSpy = jest.fn();
    const model = {
      onMount: onMountSpy,
      onUnmount: () => {},
      getState: () => ({
        isLoading: false,
        isError: false,
        error: null,
        data: [],
      }),
    };
    const useController = MVCListScreenControllerGetter(model);

    const { result } = renderHook(() => useController());
    expect(onMountSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isError).toBeFalsy();
    expect(result.current.data).toHaveLength(0);
  });

  it('should call onUnMount when unmounting', () => {
    const onUnmountSpy = jest.fn();
    const model = {
      onMount: () => {},
      onUnmount: onUnmountSpy,
      getState: () => ({
        isLoading: false,
        isError: false,
        error: null,
        data: [],
      }),
    };
    const useController = MVCListScreenControllerGetter(model);

    const renderHookApi = renderHook(() => useController());
    renderHookApi.unmount();
    expect(onUnmountSpy).toHaveBeenCalledTimes(1);
  });
});
