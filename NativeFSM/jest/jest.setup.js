import 'isomorphic-fetch';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  constants: {
    reactNativeVersion: {
      major: 0,
      minor: 63,
      patch: 3,
    },
  },
  select: (options) => options.ios,
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  return require('../store/utils/StoreRepository/StoreInterface.mock').getMockStoreInferface();
});

/*
  Resolves Reference Error when jest tests exit

ReferenceError: You are trying to `import` a file after the Jest environment has been torn down.

      at Object.get Linking [as Linking] (node_modules/react-native/index.js:241:12)
      at node_modules/@react-navigation/native/lib/commonjs/useLinking.native.tsx:121:15
      at Object.invokeGuardedCallbackProd (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11308:10)
      at invokeGuardedCallback (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11499:31)
      at flushPassiveEffectsImpl (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14560:11)
*/
jest.mock('@react-navigation/native/lib/commonjs/useLinking.native', () => ({
  default: () => ({ getInitialState: { then: jest.fn() } }),
  __esModule: true,
}));
