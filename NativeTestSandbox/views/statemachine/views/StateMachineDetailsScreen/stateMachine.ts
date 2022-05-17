import { createMachine, assign } from 'xstate';

import { Item } from '../../../../types';

export const fetchState = {
  id: 'StateMachineDetailsScreen',
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

export const fetchMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUAuBDVYCy6DGAFgJYB2YAImBkQDazJ4BOYYJAdERDWAMQBiAUQAqAYQASiUAAcA9rCKoiMkpJAAPRAEYAbABY2AVk0BOAMwAOAOwAGSwCZd2g84A0IAJ5bNdtnuvnTOztjAztnTQBfCLc0TBx8YjJKajoGZlY2Ghl0CFIoHghlMA4SADcZAGti2KxcQlIKKnRaeiYWdiycvIRScrxMJRIAbWsAXVVZeUVlVQ0EA1NrNkttEKNjTQNdRwM3TwRLUzZNTetNXTttU2M-bSiYjFqEhuTm1LaMztySfLBGRhkjDYUhomAAZoCALZsGrxepJJotNLtTLZb5QHplGT9abDMYTOQKQazRALHx2Q6OSzU+zmOyaPZabRLE66YzGax2Uy6UyWAxRaIgEgyCBwVSwuqJRopVrpdicbgEqbEpDqRAXRkITTWbTHXT+OzmXQGayhfy6e4gCXPBEy5GfNF5JVEmaquYU-SBDncik3E3aTXmJZ+Om2bTa0KmSKC63w6VvWUo2AAVzweDg8FVkxdKjdiEOS19BnM5gMxgurMDutZ7Msxi5Ru5xktsalryRH3YfwBjGduJJB10ml8VPD2hWxvMms2R3DbPMV3MN31hxbjzhbcR7zlfZVoDmminHkQLNOwT0wTOOt5lgFESAA */
  createMachine(
    {
      tsTypes: {} as import('./stateMachine.typegen').Typegen0,
      schema: {
        context: {} as { result: Item | undefined },
        events: {} as { type: 'FETCH'; id: string },
        services: {} as {
          fetchService: {
            data: Item;
          };
        },
      },
      ...fetchState,
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
