require("dotenv").config()
const db = require("./orm")
const serviceDB = require('./service.orm')
const { ToadScheduler, SimpleIntervalJob } = require("toad-scheduler")

const { matchIdTask } = require("./task/task")

const scheduler = new ToadScheduler()

//데이터베이스 연결
db.connect()
serviceDB.connectService()

// 매치Id 수집
const matchIdJob = new SimpleIntervalJob({ hours: 1, runImmediately: true }, matchIdTask) // runImmediately: 즉시실행
// runImmediately: 즉시실행
scheduler.addSimpleIntervalJob(matchIdJob)
