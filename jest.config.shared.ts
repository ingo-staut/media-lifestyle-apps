import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  clearMocks: true,
  preset: "jest-preset-angular",
  roots: ["<rootDir>/shared"],
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^shared/(.*)$": "<rootDir>/shared/$1",
  },
};

export default config;
