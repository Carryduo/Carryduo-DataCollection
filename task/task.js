const { sleep } = require("../timer")
const { performance } = require("perf_hooks")
const summonerController = require("../analyze/summonerId/summonerId.controller")
const puuidController = require("../analyze/puuId/puuId.controller")
const matchIdController = require("../analyze/matchId/matchId.controller")
const dataRetirementController = require("../analyze/data-retirement/data.retirement.controller")
const { testRiotRequest } = require('../analyze/common.request')
const logger = require("../log")


require("dotenv").config()
const db = require("../orm")

process.on('message', async function (m) {
    const start = performance.now()
    let done
    const response = await testRiotRequest()
    const cpuUsage = process.cpuUsage()
    console.log(m)
    if (response) {
        if (m.parameter === 0) {
            await db.connect()
            console.log('DB 연결 작업 완료')
            done = 'connect'
        }
        else if (m.parameter === 6) {
            await sleep(10)
            await deleteData()
            console.log('분석 작업 완료')
            console.log(process.cpuUsage(cpuUsage))
            done = 'delete'
        }
        else {
            await sleep(10)
            await collectMatchId()
            console.log('수집 작업 완료')
            console.log(process.cpuUsage(cpuUsage))
            done = 'collect'
        }
        const end = performance.now()
        const runningTime = end - start
        const ConversionRunningTime = String(runningTime / (1000 * 60) / 60).split('.')[0]
        const ConversionRunningMinute = (runningTime / (1000 * 60)) % 60
        logger.info(
            `===${m.parameter} 번째 작업:${done} ${ConversionRunningTime}시간 ${ConversionRunningMinute}분 소요===`
        )
    } else {
        done = 'API expiration'
    }
    process.send({ parameter: m.parameter, done })
})

async function collectMatchId() {
    await sleep(10)
    await summonerController.summonerId()
    await sleep(10) // setTimmer를 이용해서 db가 온전히 연결된 이후에 데이터 분석 시작
    await puuidController.puuId()
    await sleep(10)
    await matchIdController.matchId()
    await sleep(10)
}

async function deleteData() {
    // Outdated matchId 처리
    await dataRetirementController.deleteOutdatedData("matchId")

    //   Wrong matchId 처리
    await dataRetirementController.deleteWrongData('matchId')
    await dataRetirementController.deleteWrongData('puuId')
    await dataRetirementController.deleteWrongData('summonerId')
}