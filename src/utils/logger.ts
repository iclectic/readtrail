type LogArgs = unknown[];

function devOnly(method: (...args: LogArgs) => void, ...args: LogArgs) {
  if (__DEV__) method(...args);
}

export const logger = {
  debug: (...args: LogArgs) => devOnly(console.debug, ...args),
  info: (...args: LogArgs) => devOnly(console.info, ...args),
  warn: (...args: LogArgs) => devOnly(console.warn, ...args),
  log: (...args: LogArgs) => devOnly(console.log, ...args),
  error: (...args: LogArgs) => console.error(...args),
};
