import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  testRegex: "/src/.*\\.test?\\.ts$",
  moduleFileExtensions: ["ts", "js"],
  moduleDirectories: ["node_modules", "src"],
};
export default config;
