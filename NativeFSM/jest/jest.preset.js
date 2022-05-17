const reactNativePreset = require('react-native/jest-preset');

/* react-native-testing-library tests throw a warning when multiple `await` calls happen in a test
https://github.com/callstack/react-native-testing-library/issues/379

  console.error
    Warning: You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);

      at printWarning (../node_modules/react-test-renderer/cjs/react-test-renderer.development.js:68:30)
      at error (../node_modules/react-test-renderer/cjs/react-test-renderer.development.js:44:5)
      at ../node_modules/react-test-renderer/cjs/react-test-renderer.development.js:15297:13
      at tryCallOne (../node_modules/react-native/node_modules/promise/lib/core.js:37:12)
      at ../node_modules/react-native/node_modules/promise/lib/core.js:123:15
      at flush (../node_modules/asap/raw.js:50:29)


  This is a workaround for that which involves overwriting the global Promise while tests run
*/

module.exports = Object.assign({}, reactNativePreset, {
  setupFiles: [require.resolve('./save-promise.js')]
    .concat(reactNativePreset.setupFiles)
    .concat([require.resolve('./restore-promise.js')]),
});
