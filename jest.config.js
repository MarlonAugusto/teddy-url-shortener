module.exports = {
    rootDir: "./",
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ["json", "lcov", "text", "html"],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    collectCoverageFrom: [
      "src/**/*.ts",
      "!src/main.ts",
      "!src/**/*.module.ts",
      "!src/**/models/*",
      "!src/**/dto/*",
      "!src/database/**/*",
      "!src/**/types/*",
    ],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
  };
  