import EventEmitter from 'events';
import { Item } from 'types';

export const EVENTS = {
  LOADING: 'LOADING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

type MetaState = {
  isLoading: boolean;
  isError: boolean;
  error: null | Error;
  data: Item[];
};

export const MCVListScreenModelGetter =
  (
    fetch: (
      input: RequestInfo,
      init?: RequestInit | undefined,
    ) => Promise<Response>,
  ) =>
  () => {
    const emitter = new EventEmitter();
    // initial meta state
    let state = {
      isLoading: false,
      isError: false,
      error: null,
      data: [],
    } as MetaState;

    const fetchItems = async () => {
      // loading
      state = {
        isLoading: true,
        isError: false,
        error: null,
        data: state.data,
      };
      emitter.emit(EVENTS.LOADING);
      const itemList = (await fetch('http://localhost:9000/items')
        .then((res) => res.json())
        .catch((err) => {
          // error
          state = {
            isLoading: false,
            isError: true,
            error: err,
            data: [],
          };
          emitter.emit(EVENTS.ERROR);
        })) as unknown as Item[];

      // success
      state = {
        isLoading: false,
        isError: false,
        error: null,
        data: itemList,
      };
      emitter.emit(EVENTS.SUCCESS);
    };

    const addSubscriber = (listenerCb: () => void) => {
      emitter.addListener(EVENTS.LOADING, listenerCb);
      emitter.addListener(EVENTS.ERROR, listenerCb);
      emitter.addListener(EVENTS.SUCCESS, listenerCb);
    };

    const removeSubscriber = () => {
      emitter.removeListener(EVENTS.LOADING, () => {});
      emitter.removeListener(EVENTS.ERROR, () => {});
      emitter.removeListener(EVENTS.SUCCESS, () => {});
    };

    return {
      onMount: (listenerCb: () => void) => {
        addSubscriber(listenerCb);
        fetchItems();
      },
      onUnmount: () => {
        removeSubscriber();
      },
      getState: () => state,
    };
  };

type ModelGetter = ReturnType<typeof MCVListScreenModelGetter>;
export type Model = ReturnType<ModelGetter>;
