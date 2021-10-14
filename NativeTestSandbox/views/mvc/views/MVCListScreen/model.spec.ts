import { itemBuilder } from '../../../../test/mocks/item';
import { MCVListScreenModelGetter } from './model';

describe('MCVListScreenModel', () => {
  it('should begin with initial state', () => {
    const mockFetch = () => Promise.resolve({} as any);
    const model = MCVListScreenModelGetter(mockFetch)();

    expect(model.getState().isLoading).toBeFalsy();
    expect(model.getState().isError).toBeFalsy();
    expect(model.getState().error).toBeFalsy();
    expect(model.getState().data).toHaveLength(0);
  });

  it('should be loading while fetch is in flight', () => {
    const mockFetch = () => {
      const promise = new Promise((res) => {
        setTimeout(() => {
          res({} as any);
        }, 10000);
      }) as Promise<Response>;
      return promise;
    };
    const model = MCVListScreenModelGetter(mockFetch)();
    const spy = jest.fn();

    model.onMount(spy);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(model.getState().isLoading).toBeTruthy();
  });

  it('should load with data onMount', (done) => {
    const itemList = [itemBuilder()];
    const mockFetch = () => {
      const promise = new Promise((res) => {
        res({
          json: () => Promise.resolve(itemList),
        } as any);
      }) as Promise<Response>;
      return promise;
    };
    const model = MCVListScreenModelGetter(mockFetch)();
    const spy = jest.fn();

    model.onMount(spy);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(model.getState().isLoading).toBeTruthy();
    expect(model.getState().data).toHaveLength(0);
    setTimeout(() => {
      expect(spy).toHaveBeenCalledTimes(2);
      expect(model.getState().isLoading).toBeFalsy();
      expect(model.getState().data).toEqual(itemList);
      done();
    }, 100);
  });
});
