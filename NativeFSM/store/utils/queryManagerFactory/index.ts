import { AnyEventObject, EventObject } from 'xstate';

import { queryMachineFactory } from '../queryMachine';
import { queryMachineWithColdStoreFactory } from '../queryMachineWithColdStorage';
import { eventBusGenerator } from './eventBusGenerator';
import { hookGenerator } from './hookGenerator';
import { storeRepository } from '../StoreRepository';
import { eventsGenerator } from './eventsGenerator';

type Config = {
  machineId: string;
  persistToStorage: boolean;
  eventPrefix: string;
  query: any;
  staleTime: number;
};

export const queryManagerFactory = <
  ResultType,
  ArgType,
  TEvent extends EventObject = AnyEventObject,
>(
  config: Config,
) => {
  const subscription = eventBusGenerator<TEvent>(config.eventPrefix);

  const queryMachine = config.persistToStorage
    ? queryMachineWithColdStoreFactory<ResultType, ArgType>({
        id: config.machineId,
        query: config.query,
        staleTime: config.staleTime,
        eventPrefix: config.eventPrefix,
        eventSubscriber: subscription,
        storeRepository,
        storageKey: config.eventPrefix,
      })
    : queryMachineFactory<ResultType>({
        id: config.machineId,
        query: config.query,
        staleTime: config.staleTime,
        eventPrefix: config.eventPrefix,
        eventSubscriber: subscription,
      });

  return {
    subscription,
    queryMachine,
    hook: hookGenerator<ResultType, ArgType>(queryMachine),
    events: eventsGenerator(config.eventPrefix),
  };
};
