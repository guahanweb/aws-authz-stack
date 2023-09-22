module.exports = {
    preset: 'ts-jest',
    collectCoverage: true,
    globals: {
        __webpack_public_path__: ''
    },
    testEnvironment: 'node',
    testEnvironmentOptions: {
        url: 'http://localhost',
    },
};