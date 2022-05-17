export const mergeMetaTests = (state: any, tests: any) => {
  return {
    ...state,
    states: Object.entries(state.states).reduce((s, [stateKey, stateValue]) => {
      return {
        ...s,
        [stateKey]: {
          ...(stateValue as any),
          meta: {
            ...(stateValue as any).meta,
            test: tests[stateKey],
          },
        },
      };
    }, {}),
  };
};
