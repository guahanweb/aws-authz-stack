import winston from "winston";

const {
    colorize,
    combine,
    errors,
    json,
    ms,
    printf,
    splat,
    timestamp
} = winston.format;

const customLogLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5,
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'cyan',
    }
};

export interface ICareAcademyLogger extends winston.Logger {
    fatal: Function;
    trace: Function;
    child: (opts: any) => any; // should be a winston.Logger type
}

export interface ILoggerOptions {
    service: string;
    level: 'fatal'|'error'|'warn'|'info'|'debug'|'trace'
}
/*
const log = logger({
    service: 'testing',
    level: 'trace',
});

log.warn("here we go!");
log.debug("lots of information here");
*/

export function logger(opts?: ILoggerOptions): ICareAcademyLogger {
    const colorizer = colorize();

    // we need to register colors for non-default levels
    colorizer.addColors(customLogLevels.colors);

    const consoleTransport = new winston.transports.Console({
        format: combine(
            colorize({ all: true }),
            timestamp({ format: "YY-MM-DD HH:mm:ss" }),
            printf(
                info => {
                    let output = `[${info.timestamp}] (${info.service}) ${info.level}: ${info.message}`;

                    // if we have stack trace, dump it as well
                    if (info.stack) {
                        output += `\n${info.stack}`;
                    }

                    return output;
                }
            ),
        )
    });

    return winston.createLogger({
        levels: customLogLevels.levels,
        level: opts.level || 'info',
        defaultMeta: { service: opts.service || 'app' },
        format: combine(
            timestamp(),
            ms(),
            errors({ stack: true }),
            splat(),
            json(),
        ),
        transports: [
            consoleTransport,
        ],
    }) as ICareAcademyLogger;
}