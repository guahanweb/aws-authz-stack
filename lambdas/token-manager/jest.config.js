module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        // suppress the warning for esModuleInterop
        '^.+\\.ts?$': ['ts-jest', { diagnostics: { ignoreCodes: [151001] } }],
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
}