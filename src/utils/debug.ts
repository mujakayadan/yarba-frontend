import { env } from '../config/env';

const isDebugMode = env.debug;

export const createDebugger = (namespace: string) => {
  return {
    log: (...args: unknown[]) => {
      if (isDebugMode) {
        console.log(`[${namespace}]`, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (isDebugMode) {
        console.info(`[${namespace}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDebugMode) {
        console.warn(`[${namespace}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      if (isDebugMode) {
        console.error(`[${namespace}]`, ...args);
      } else {
        console.error(...args);
      }
    },
    group: (label: string) => {
      if (isDebugMode) {
        console.group(`[${namespace}] ${label}`);
      }
    },
    groupEnd: () => {
      if (isDebugMode) {
        console.groupEnd();
      }
    },
    table: (data: unknown) => {
      if (isDebugMode) {
        console.log(`[${namespace}] Table:`);
        console.table(data);
      }
    },
  };
};

export const debug = createDebugger('App');

export default debug;
