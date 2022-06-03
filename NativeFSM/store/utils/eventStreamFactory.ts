import EventEmitter from 'events';

export type Events = {
  INITIALIZED: string;
  LOADING: string;
  SUCCESS: string;
  ERROR: string;
  RESET: string;
};

export const eventStreamFactory = (events: Events) => {
  const eventStream = new EventEmitter();

  return {
    eventStream,
    emitInitialized: () => eventStream.emit(events.INITIALIZED),
    emitLoading: () => eventStream.emit(events.LOADING),
    emitSuccess: () => eventStream.emit(events.SUCCESS),
    emitError: () => eventStream.emit(events.ERROR),
    emitReset: () => eventStream.emit(events.RESET),
  };
};
