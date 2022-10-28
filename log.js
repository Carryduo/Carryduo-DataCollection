const winston = require("winston")
const winstonDaily = require("winston-daily-rotate-file")
const process = require("process")

const { combine, timestamp, label, printf } = winston.format

const logDir = process.env.LOG || `./logs`

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}` // 날짜 [시스템이름] 로그레벨 메세지
})

const logger = winston.createLogger({
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        label({ label: "Carryduo Data-Analysis" }),
        logFormat
    ),

    transports: [
        new winstonDaily({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/info",
            filename: `%DATE%.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
        new winstonDaily({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error",
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
})

// prod 개발환경이 아닌 경우에는 로그 남기면서 콘솔까지 남김
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            handleExceptions: true,
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
    )
}

module.exports = logger
