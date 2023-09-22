import { logger } from './index'

describe ('Logger', () => {
    it ('should initialize properly', () => {
        const log = logger({
            service: 'testing',
            level: 'debug',
        });

        // naive check to be sure our functions are existent
        expect(typeof log.debug).toBe('function');
        expect(typeof log.info).toBe('function');
        expect(typeof log.warn).toBe('function');
        expect(typeof log.error).toBe('function');
        expect(typeof log.fatal).toBe('function');
    });
});
