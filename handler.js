const logger = require("./log")

const db = require("./orm")
const serviceDB = require("./service.orm")

const dataRetirementController = require("./analyze/data-retirement/data.retirement.controller")
const summonerController = require("./analyze/summonerId/summonerId.controller")
const puuidController = require("./analyze/puuId/puuId.controller")
const matchIdController = require("./analyze/matchId/matchId.controller")
const { sleep } = require("./timer/timer")
const { getTodayMatchDataCount } = require("./analyze/matchId/matchId.service")

const { exec } = require("child_process")

require("dotenv").config()

async function handler() {
    try {
        let count = 1

        await db.connect()
        await serviceDB.connectService()
        console.log("DB 연결 작업 완료")

        const response = await summonerController.testRiotRequest()

        if (response) {
            while (true) {
                const start = performance.now()
                await collectData()
                console.log("데이터 수집 작업 완료")
                sleep(3)
                await deleteData()
                console.log("불순 데이터 삭제 작업 완료")

                const { today_matchid_count } = await getTodayMatchDataCount()
                if (today_matchid_count > 30000) {
                    const now = new Date()
                    logger.info(
                        `데이터 수집 프로세스 종료 수집한 matchId 개수:${today_matchid_count}, 종료 시간:${now}`
                    )
                    exec("pm2 stop handler.js")
                }

                const end = performance.now()
                const runningTime = end - start
                const ConversionRunningTime = String(runningTime / (1000 * 60) / 60).split(".")[0]
                const ConversionRunningMinute = (runningTime / (1000 * 60)) % 60
                logger.info(
                    `===${count} 번째 작업 ${ConversionRunningTime}시간 ${ConversionRunningMinute}분 소요 수집한 matchId: ${today_matchid_count}===`
                )
                count++
            }
        } else {
            throw new Error("API expiration")
        }
    } catch (error) {
        logger.error(error, { message: "-from handler" })
    }
}

handler()

async function deleteData() {
    // Outdated matchId 처리
    await dataRetirementController.deleteOutdatedData("matchId")
    // Wrong data 처리
    await dataRetirementController.deleteWrongData("matchId")
    await dataRetirementController.deleteWrongData("puuId")
    await dataRetirementController.deleteWrongData("summonerId")
}

async function collectData() {
    await summonerController.summonerId()
    await puuidController.puuId()
    await matchIdController.matchId()
}
