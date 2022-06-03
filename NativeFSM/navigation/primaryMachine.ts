import { createMachine } from 'xstate';

export const machineConfig = {
  id: 'PrimaryMachine',
  context: {},
  initial: 'bootstrapping',
  states: {
    bootstrapping: {
      invoke: {
        src: 'bootstrap',
        onDone: 'checkAuth',
      },
    },
    checkAuth: {
      always: [
        {
          cond: 'isAuthenticated',
          target: 'authenticated',
        },
        {
          target: 'unauthenticated',
        },
      ],
    },
    loggingIn: {
      invoke: {
        src: 'login',
        onDone: 'authenticated',
        onError: 'loggingOut',
      },
    },
    loggingOut: {
      invoke: {
        src: 'logout',
        onDone: 'unauthenticated',
      },
    },
    authenticated: {
      on: { LOGOUT: 'loggingOut' },
    },
    unauthenticated: {
      on: { LOGIN: 'loggingIn' },
    },
  },
};

export const primaryMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAUBOBLAtgQ1QTwFlsBjAC3QDswA6SkgF3QDcwBiAQQGEAVASQDV23AKKJQABwD2sdI0kUxIAB6IA7AA5q6gJwBWAAzqAjAGYjugwBYjAGhB5EAJksnqANg-aT2x7vNvVEzcAX2C7NCxcQhJyKmoAI0lJelh6VGxxcUooVgh5GkomSQBrGgicfCIyShpE5NT0zOyEQslibDkKAG19AF1FKRlOxRUEZzdqXVVnS3U3FzdtQzsHBBNLCeNVI0dPdV1FkLCQcqiq2JoyMGJi9gBXelJWAelZdHkRxBdHdwDVfV02iMATc6lUK0Q5lcYMc+hMjn2QMMHlC4QwFWi1TiABtJFAoNleBRcvlaBQiqVqKdKjEatRcfjCRQWuS2h13t0+i8hhzPghpj8kdp1JZVF59upHBC1vp9JN5kYgdptBt9Ko3LpUSd0WdaTi8QSKFAiawwKhUJJUNRxNiOgAzS2YKk6mlYmgMw3G5mtdqdHr9JAgQZvD6B0Y6H7eBEmXTWNxBIzg+yIEyy+XWJUqtxq1Ra6mYi70g3ZADyDxJcValPz5zpHtLDxZRV9HP93JDCjDkLVEx2cMss0cGmFUuTazB1BVRlFqhnseneZdBbp2AepDAFEYvsgrAAMiWAOIlgCq3Hbwy7CCWRncBg8+0VQLc0thui0030zl0Cfh6kXkVdQs7goVdHg3LcOh3fcD14AA5c9eUvSxtFUahZ10SV-mMOEgWlSxAS0SxHEVRxHD0DVARMUJjgoSQIDgRQaz1AoQOIRgWAQ0NQFGIjpWnVCTA-R8dl8QIjH-DFaziOoUjSDIsiNTjO24lM3zmExJVI4Us20Z8xzMSwtETUxLH0XTVH+IIJN1N1qCuG57keJS+WcVCXF0ocML0Yjpz40VqEE2FhNIqYzGswC62LI0iWcy9LMmQEiIwg5zDFPCh0I4j1BFbYfBmcLl31RkjTLehYpUhAjABCZ1WyzyvEMdQ+MCd9FTBHDFSqzVjiY2zQPXTd0G3CByuURBDknHQqqMKqETBJqx0fAKhPMCNjFFAqpJoYD+vAobIJGwNgwvCqB0M8xhTmfQjH2AIvGlDSbwHad5m-fRFllSxNuY0bRhmrR400sidA2PQk1WWdlthawiI2OZhWo4IgA */
  createMachine({
    tsTypes: {} as import('./primaryMachine.typegen').Typegen0,
    schema: {
      context: {} as {},
      events: {} as { type: 'LOGIN' | 'LOGOUT' | 'always' },
      services: {} as {
        bootstrap: {
          data: any;
        };
        login: {
          data: any;
        };
        logout: {
          data: any;
        };
      },
    },
    ...machineConfig,
  });
