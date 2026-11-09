// Expo defines __DEV__ at runtime; Node/Jest tests need a stand-in.
(globalThis as { __DEV__?: boolean }).__DEV__ = false;
