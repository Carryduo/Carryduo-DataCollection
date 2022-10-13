const { sleep } = require("./timer");
const { performance } = require("perf_hooks");
const summonerController = require("./analyze/summonerId/summonerId.controller");
const puuidController = require("./analyze/puuId/puuId.controller");
const matchIdController = require("./analyze/matchId/matchId.controller");
const { AsyncTask } = require("toad-scheduler");
const fs = require("fs");

const matchIdTask = new AsyncTask(
  "task",
  async () => {
    //데이터베이스 연결

    //데이터 분석 로직 수행
    // TODO: api키가 정상이면 실행, 아니면 실행 취소
    // return console.log('API 키 만료')
    const response = await summonerController.testRiotRequest();
    console.log(response);
    if (response) {
      return await startGetMatchIds();
    } else {
      const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
      const time = new Date().toTimeString().split(" ")[0];
      const data = "\nerror: " + "API 키 만료" + " ||" + " Date: " + date + " Time: " + time;
      return fs.writeFile(
        process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
        data,
        { flag: "a+" },
        (err) => {
          console.log(err);
        }
      );
    }
  },
  (err) => {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
    const time = new Date().toTimeString().split(" ")[0];
    const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time;

    fs.writeFile(
      process.env.SCHEDUL_LOG || `./logs/schedule.error.txt`,
      data,
      { flag: "a+" },
      (error) => {
        console.log(err);
      }
    );
  }
);

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

    const end = performance.now();
    const runningTime = end - start;
    const ConversionRunningTime = (runningTime / (1000 * 60)) % 60;
    console.log(`===${ConversionRunningTime} 분소요===`);
  } catch (err) {
    const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
    const time = new Date().toTimeString().split(" ")[0];
    const data = "\nerror: " + err.toString() + " ||" + " Date: " + date + " Time: " + time;

    fs.writeFile(
      process.env.LOG || `./logs/champ.analyze.error.txt`,
      data,
      { flag: "a+" },
      (error) => {
        console.log(err);
      }
    );
  }
}

module.exports = { matchIdTask };
