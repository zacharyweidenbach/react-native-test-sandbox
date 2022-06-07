import { AnyEventObject, EventObject } from 'xstate';

import { fromEventBus } from '../../../utils/xstate/fromEventBus';
import { EventBus } from '../../../utils/xstate/EventBus';

export const eventBusGenerator = <TEvent extends EventObject = AnyEventObject>(
  id: string,
) => {
  const eventBus = new EventBus<TEvent>(id);
  return {
    id,
    src: fromEventBus(() => eventBus),
  };
};
