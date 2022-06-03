import EventEmitter from 'events';
import { createMachine } from 'xstate';
import { sendParent } from 'xstate/lib/actions';

import { Events } from './eventStreamFactory';

type Config = {
  eventStream: EventEmitter;
  events: Events;
  id: string;
};

export const subscriptionMachineFactory = (config: Config) =>
  createMachine({
    id: config.id,
    initial: 'idle',
    states: {
      idle: {
        invoke: {
          src: () => (callback) => {
            const initializeSubscription = () =>
              callback(config.events.INITIALIZED);
            const loadingSubscription = () => callback(config.events.LOADING);
            const successSubscription = () => callback(config.events.SUCCESS);
            const errorSubscription = () => callback(config.events.ERROR);
            const resetSubscription = () => callback(config.events.RESET);
            config.eventStream.addListener(
              config.events.INITIALIZED,
              initializeSubscription,
            );
            config.eventStream.addListener(
              config.events.LOADING,
              loadingSubscription,
            );
            config.eventStream.addListener(
              config.events.SUCCESS,
              successSubscription,
            );
            config.eventStream.addListener(
              config.events.ERROR,
              errorSubscription,
            );
            config.eventStream.addListener(
              config.events.RESET,
              resetSubscription,
            );
            return () => {
              config.eventStream.removeListener(
                config.events.INITIALIZED,
                initializeSubscription,
              );
              config.eventStream.removeListener(
                config.events.LOADING,
                loadingSubscription,
              );
              config.eventStream.removeListener(
                config.events.SUCCESS,
                successSubscription,
              );
              config.eventStream.removeListener(
                config.events.ERROR,
                errorSubscription,
              );
              config.eventStream.removeListener(
                config.events.RESET,
                resetSubscription,
              );
            };
          },
        },
      },
    },
    on: {
      [config.events.INITIALIZED]: {
        actions: sendParent(config.events.INITIALIZED),
      },
      [config.events.LOADING]: { actions: sendParent(config.events.LOADING) },
      [config.events.SUCCESS]: { actions: sendParent(config.events.SUCCESS) },
      [config.events.ERROR]: { actions: sendParent(config.events.ERROR) },
      [config.events.RESET]: { actions: sendParent(config.events.RESET) },
    },
  });
