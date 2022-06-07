export const eventsGenerator = (prefix: string) => ({
  INITIALIZED: `${prefix}.INITIALIZED`,
  LOADING: `${prefix}.LOADING`,
  SUCCESS: `${prefix}.SUCCESS`,
  ERROR: `${prefix}.ERROR`,
  RESET: `${prefix}.RESET`,
});
