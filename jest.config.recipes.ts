import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  clearMocks: true,
  preset: "jest-preset-angular",
  roots: ["<rootDir>/projects/recipes"],
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^shared/(.*)$": "<rootDir>/shared/$1",
    "^projects/(.*)$": "<rootDir>/projects/$1",
  },
};

export default config;
