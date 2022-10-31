require("dotenv").config()
const db = require("./orm")

const { ToadScheduler, SimpleIntervalJob } = require("toad-scheduler")

const { matchIdTask, dataRetirementTask } = require("./task/task")

const scheduler = new ToadScheduler()

//데이터베이스 연결
db.connect()

// 매치Id 수집
const matchIdJob = new SimpleIntervalJob({ hours: 12, runImmediately: true }, matchIdTask) // runImmediately: 즉시실행
const dataRetirementJob = new SimpleIntervalJob(
    { days: 14, runImmediately: true },
    dataRetirementTask
)
// runImmediately: 즉시실행
scheduler.addSimpleIntervalJob(matchIdJob)
scheduler.addSimpleIntervalJob(dataRetirementJob)
