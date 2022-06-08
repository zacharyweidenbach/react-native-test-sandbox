import { Event, EventObject, AnyEventObject, InvokeCreator } from 'xstate';

import { EventBus } from './EventBus';

type Listener<TEvent extends EventObject> = (event: Event<TEvent>) => void;

/**
 * Create an invoked service for a event bus.
 * @param createEventBus Create a EventBus
 * @returns an invoke creator
 */
export function fromEventBus<
  TContext,
  TEvent extends EventObject = AnyEventObject,
>(
  createEventBus: (context: TContext, event: TEvent) => EventBus<TEvent>,
): InvokeCreator<TContext, TEvent> {
  return (context, event) => (sendBack, receive) => {
    const bus = createEventBus(context, event);

    const listener: Listener<TEvent> = (event) => {
      sendBack(event);
    };

    const subscription = bus.subscribe(listener);

    receive((event) => {
      bus.send(event, listener);
    });

    return () => {
      subscription.unsubscribe();
    };
  };
}
