import { createMachine, assign } from 'xstate';

import { Item } from '../../../../../../types';

export const machineConfig = {
  id: 'PlayerDetailsScreen',
  context: { result: undefined },
  initial: 'idle',
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: 'fetchService',
        onDone: {
          target: 'success',
          actions: 'storeResult',
        },
        onError: 'error',
      },
    },
    success: { type: 'final' as const },
    error: { type: 'final' as const },
  },
};

export const PlayerDetailsScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDEDKBZAImALgQwEsAbWVAYwCcwwA7AOgIiLAGJkBRAFQGEAJRUAAcA9rAI4CwmgJAAPRAEYArADY6SgCwaAnAA4ATNoUAGZSv1KANCACei-Rrr6FClQHY3SgMxvtmtwoAvoHWaFi4hCTkVLR0RMJ4EAQ0UCwQUmAMNABuwgDWmWHY+MSklNT08YnJUAjJuWR4ElIA2sYAujIiYs3SSHKIGp50ugqGGkoKGmMKo9Z2CLq6dL5Kpl4a+h4bXrrBoRjFkWUxlQlJKSxgFBTCFHSCRE0AZncAtnRFEaXRFXHnNTqOWEjV6bU6-W64kkfVA8gQQyUIzG2gmUxmc1simGq3Wm22Gl2wRCIBowggcBkXxKUXKsUYzC6omhUhk8M280UCm0dC86KWKi82i8+kM+n2IGpx1+sSqFygTJ6MLZiAsPKWuk8xl0xiU+h1Kk5CFRdG0KlcOuMqI0pl1EqlPzp9FgAFcyGQ4PBIczeiqECoAyN9Uo3KZps5dEaTF5edpPM44-oVKoLPbDt9aac6NdbhRFSzYQN-YGDLoQ2GMVHQyM43qJoYTBY9iSHZmKvnff14bMo0jfDptML3Fs-PovMTAkA */
  createMachine(
    {
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        context: {} as { result: Item | undefined },
        events: {} as { type: 'FETCH'; id: string },
        services: {} as {
          fetchService: {
            data: Item;
          };
        },
      },
      ...machineConfig,
    },
    {
      services: {
        fetchService: async (_context, event) => {
          const response = await fetch(
            `http://localhost:9000/items/${event.id}`,
          );
          if (response.ok) {
            const items = await response.json();
            return items;
          } else {
            throw new Error('Failed to fetch item.');
          }
        },
      },
      actions: {
        storeResult: assign({
          result: (_, event) => event.data,
        }),
      },
    },
  );
