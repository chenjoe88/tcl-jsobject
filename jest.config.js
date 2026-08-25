module.exports = {
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  testMatch: ['<rootDir>/src/**/*.test.js'],
};
