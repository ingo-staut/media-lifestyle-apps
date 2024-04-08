// mockMatchMedia.js

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated, but required for compatibility
    removeListener: jest.fn(), // deprecated, but required for compatibility
  })),
});
