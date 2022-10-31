const { sleep } = require("../timer");
const { performance } = require("perf_hooks");
const summonerController = require("../analyze/summonerId/summonerId.controller");
const puuidController = require("../analyze/puuId/puuId.controller");
const matchIdController = require("../analyze/matchId/matchId.controller");
const dataRetirementController = require('../analyze/data-retirement/data.retirement.controller')

const { AsyncTask } = require("toad-scheduler");
const fs = require("fs");
const logger = require('../log')

const matchIdTask = new AsyncTask(
    "task",
    async () => {
        const response = await summonerController.testRiotRequest();
        console.log(response);
        if (response) {
            return await startGetMatchIds();
        } else {
            logger.info('라이엇 API키 만료')
        }
    },
    (err) => {
        logger.error(err, { message: '-from matchIdtask' })
    }
);

const dataRetirementTask = new AsyncTask(
    "task",
    async () => {
        await sleep(5)
        return await startRetirement();
    },
    (err) => {
        logger.error(err, { message: '-from dataRetirementTask' })
    }
);

async function startRetirement() {
    try {
        const start = performance.now();

        await dataRetirementController.deleteOutdatedData('combination')
        await dataRetirementController.deleteOutdatedData('simulation')

        const end = performance.now();
        const runningTime = end - start;
        const ConversionRunningTime = (runningTime / (1000 * 60)) % 60;
        console.log(`===${ConversionRunningTime} 분소요===`);
        logger.info(`===${ConversionRunningTime} 분소요===`)
    } catch (err) {
        logger.err(err, { message: '-from dataretriementTaskMethod' })
    }
}
async function startGetMatchIds() {
    try {
        const start = performance.now();
        // 로우데이터 수집
        await sleep(10);
        await summonerController.summonerId();
        await sleep(10); // setTimmer를 이용해서 db가 온전히 연결된 이후에 데이터 분석 시작
        await puuidController.puuId();
        await sleep(10);
        await matchIdController.matchId();
        await sleep(10);

        // TODO: matchId 삭제 관련
        // await dataRetirementController.deleteWrongMatchId()
        // await dataRetirementController.deleteOutdatedMatchId()

        const end = performance.now();
        const runningTime = end - start;
        const ConversionRunningTime = (runningTime / (1000 * 60)) % 60;
        console.log(`===${ConversionRunningTime} 분소요===`);
        logger.info(`===${ConversionRunningTime} 분소요===`)
    } catch (err) {
        logger.error(err, { message: '-from matchIdTaskMethod(startgetMatchIds)' })
    }
}

module.exports = { matchIdTask, dataRetirementTask };
