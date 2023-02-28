const { sleep } = require("../timer/timer")
const { performance } = require("perf_hooks")
const summonerController = require("../analyze/summonerId/summonerId.controller")
const puuidController = require("../analyze/puuId/puuId.controller")
const matchIdController = require("../analyze/matchId/matchId.controller")
const dataRetirementController = require("../analyze/data-retirement/data.retirement.controller")

const { AsyncTask } = require("toad-scheduler")
const logger = require("../log")

const db = require("../orm")
const serviceDB = require("../service.orm")
const { exec } = require("child_process")

process.on("message", async function (m) {
    try {
        const start = performance.now()

        const response = await summonerController.testRiotRequest()
        const cpuUsage = process.cpuUsage()

        let done
        if (response) {
            if (m.parameter === 0) {
                await db.connect()
                await serviceDB.connectService()
                console.log("DB 연결 작업 완료")
                done = "connect"
            } else if (m.parameter === 1) {
                await summonerController.summonerId()
                console.log("summonerId 수집 완료")
                done = "summonerId"
            } else if (m.parameter > 1 && m.parameter <= 5) {
                await puuidController.puuId()
                console.log("puuId 수집 완료")
                console.log(process.cpuUsage(cpuUsage))
                done = "puuId"
            } else if (m.parameter === 21) {
                await deleteData()
                console.log("필요 없는 데이터 삭제 완료")
                console.log(process.cpuUsage(cpuUsage))
                done = "delete"
            } else if (m.done === "finish") {
                const now = new Date()
                console.log(`데이터 수집 프로세스 종료 (종료시간:${now})`)
                exec("pm2 stop handler.js")
            } else {
                await matchIdController.matchId()
                console.log("matchId 수집 완료")
                console.log(process.cpuUsage(cpuUsage))
                done = "matchId"
            }
            const end = performance.now()
            const runningTime = end - start
            const ConversionRunningTime = String(runningTime / (1000 * 60) / 60).split(".")[0]
            const ConversionRunningMinute = (runningTime / (1000 * 60)) % 60
            logger.info(
                `===${m.parameter} 번째 작업:${done} ${ConversionRunningTime}시간 ${ConversionRunningMinute}분 소요===`
            )
        } else {
            done = "API expiration"
        }
        process.send({ parameter: m.parameter, done })
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
})

async function deleteData() {
    // Outdated matchId 처리
    await dataRetirementController.deleteOutdatedData("matchId")
    // Wrong data 처리
    await dataRetirementController.deleteWrongData("matchId")
    await dataRetirementController.deleteWrongData("puuId")
    await dataRetirementController.deleteWrongData("summonerId")
}
