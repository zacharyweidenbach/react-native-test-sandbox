import { Event, EventObject, AnyEventObject, Subscription } from 'xstate';

type Listener<TEvent extends EventObject> = (event: Event<TEvent>) => void;

export class EventBus<TEvent extends EventObject = AnyEventObject> {
  state: 'running' | 'stopped' = 'running';
  listeners: Set<Listener<TEvent>> = new Set();

  constructor(readonly id: string) {}

  protected get isStopped() {
    return this.state === 'stopped';
  }

  subscribe(listener: Listener<TEvent>): Subscription {
    if (this.isStopped) return { unsubscribe: () => {} };

    this.listeners.add(listener);

    return {
      unsubscribe: () => this.listeners.delete(listener),
    };
  }

  send(event: Event<TEvent>, listenerToIgnore?: Listener<TEvent>) {
    if (this.isStopped) return;

    for (const listener of this.listeners) {
      if (listener !== listenerToIgnore) listener(event);
    }
  }

  stop() {
    if (this.isStopped) return;

    this.state = 'stopped';
    this.listeners.clear();
  }
}
