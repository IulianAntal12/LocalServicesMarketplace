import type { Config } from "jest";

const config: Config = {
  // Folosim ts-jest pentru transpilare TypeScript
  preset: "ts-jest",

  // Simulam un browser (pentru React Testing Library)
  testEnvironment: "jest-environment-jsdom",

  // Fisier de setup ce importa @testing-library/jest-dom
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Pattern pentru fisierele de test
  testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],

  // Transformari: ts-jest pentru TypeScript, babel pentru JSX/TSX
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },

  // Mapeaza importurile de module CSS (styleModule mock)
  moduleNameMapper: {
    // Mock pentru fisierele CSS Modules
    "\\.module\\.(css|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.ts",
    // Mock pentru fisiere statice (imagini, svg)
    "\\.(png|jpg|jpeg|gif|svg|webp)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },

  // Colecteaza coverage
  collectCoverageFrom: [
    "src/services/providerService.ts",
    "src/features/dashboard/provider/components/ServiceModal.tsx",
  ],

  // Threshold de coverage dorit (optional, ajusteaza dupa nevoie)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Curatare automata a mock-urilor intre teste
  clearMocks: true,
  restoreMocks: true,
};

export default config;
