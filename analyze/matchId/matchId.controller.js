require("dotenv").config()
const axios = require("axios")
const logger = require("../../log")
const { sleep } = require("../../timer/timer")
const {
    findPuuId,
    saveMatchId,
    findMatchId,
    disconnect,
    getMatchData,
    transferAnlayzed,
    updateWrongPuuId,
} = require("./matchId.service")

const fs = require("fs")

exports.matchId = async (req, res, next) => {
    try {
        const result = await startGetMatchId()
        return result
    } catch (err) {
        console.log(err)
        return result
    }
}

exports.transferMatchDataAnalyzed = async () => {
    const data = await getMatchData()
    for (let i = 0; i < data.length; i++) {
        const matchId = data[i].matchId
        const analyzed = data[i].analyzed
        const result = await transferAnlayzed(matchId, analyzed)
        console.log(result)
    }
    console.log("분석정보이동완료")
    return "success "
}

let key = 0
let status
async function startGetMatchId() {
    let { offsetOption } = await matchIdReadOffset()

    const puuIds = await findPuuId(offsetOption)
    logger.info(puuIds.length, { message: "= PUUID개수/ matchId 분석 시작" })
    let matchId = []
    while (key !== puuIds.length + 1) {
        console.log(key + `번째`)

        if (status !== 403) {
            await getMatchId(puuIds, key, matchId)
        }
    }
    key = 0
    status = 0
    if (puuIds.length < 500) {
        offsetOption = 0
    } else {
        offsetOption += 500
    }

    await matchIdWriteOffset(offsetOption)
    logger.info(puuIds.length, {
        message: `= PUUID개수/ matchId 분석 완료 | 다음 offset = ${offsetOption}`,
    })
    return "success"
}

async function getMatchId(puuIds, num, matchId) {
    try {
        console.log("getMatchId 실행")
        const targetUsersApiUrl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuIds[num].puuid}/ids?start=0&count=5&api_key=${process.env.KEY}`
        const response = await axios.get(targetUsersApiUrl)

        const currentMatchId = response.data
        if (!matchId.includes(...currentMatchId)) {
            matchId.push(...currentMatchId)
        }

        for (let matchid of currentMatchId) {
            const data = await saveMatchId(
                matchid,
                puuIds[num].tier,
                puuIds[num].division,
                puuIds[num].summonerId,
                puuIds[num].puuid
            )
            //    중복값 넘어가기
            if (data.code === 1062) {
                console.log("중복이야")
                console.log(num + " 번째 부터 오류!")
                return
            }
        }
        return key++
    } catch (err) {
        if (!err.response) {
            console.log("err.response가 없다! " + err.message)
            console.log(num + " 번째 부터 오류!")
            return key++
        } else if (err.response.status === 429) {
            console.log("라이엇 요청 제한 경고!")
            console.log(key + " 번째 부터 오류!")
            await sleep(125)
        } else if (err.response.status === 403) {
            console.log(key + " 번째 부터 오류!")
            logger.info("API키 갱신 필요 - matchId 분석")
            status === 403
            return
        } else {
            logger.error(err.response.statusText, { message: "-from getMatchId" })
            await updateWrongPuuId(puuIds[num].puuid)
            return key++
        }
    }
}

async function matchIdReadOffset() {
    const fileName = "matchId-offset.txt"
    const { offsetOption } = JSON.parse(fs.readFileSync(fileName, { encoding: "utf-8" }))
    return { offsetOption }
}

async function matchIdWriteOffset(offsetOption) {
    const fileName = "matchId-offset.txt"
    const data = JSON.stringify({ offsetOption })
    fs.writeFileSync(fileName, data, { encoding: "utf-8" })
}
