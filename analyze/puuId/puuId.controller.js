require("dotenv").config()
const axios = require("axios")
const logger = require("../../log")
const { sleep } = require("../../timer/timer")
const { findSummonerId, savePuuId, updateWrongSummonerId } = require("./puuId.service")

exports.puuId = async (req, res, next) => {
    const result = await startGetPuuId()
    return result
}

let key = 0

async function startGetPuuId() {
    try {
        const summonerIds = await findSummonerId()
        console.log(summonerIds.length)
        logger.info(summonerIds.length, { message: "= summonerId 개수/ PUUID 분석 시작" })
        while (key !== summonerIds.length) {
            await getPuuId(summonerIds, key)
            key++
        }
        key = 0
        logger.info(summonerIds.length, { message: "= summonerId 개수/ PUUID 분석 완료" })
        return "success"
    } catch (err) {
        logger.error(err, { message: "-from puuid 분석" })
        return "fail"
    }
}

async function getPuuId(summonerIds, key) {
    try {
        let puuIds = []
        console.log(`${key} 번째 getPuuId 실행`)
        const targetUsersApiUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${summonerIds[key].summonerId}?api_key=${process.env.KEY}`
        const response = await axios.get(targetUsersApiUrl)
        const targetUsersPuuId = response.data.puuid
        if (!puuIds.includes(targetUsersPuuId)) {
            puuIds.push(targetUsersPuuId)
            const data = await savePuuId(
                targetUsersPuuId,
                summonerIds[key].tier,
                summonerIds[key].division,
                summonerIds[key].summonerId
            )
            if (data.code === 1062) {
                console.log("중복이야")
                console.log(key + " 번째 부터 오류!")
                return
            }
        }
    } catch (err) {
        if (!err.response) {
            console.log("err.response가 없다! " + err)
            console.log(key + " 번째 부터 오류!")
            return
        }
        if (err.response.status === 429) {
            console.log("라이엇 요청 제한 경고!")
            console.log(key + " 번째 부터 오류!")
            await sleep(125)
            return
        } else if (err.response.status === 403) {
            logger.info("API키 갱신 필요 - PUUID 분석")
            return
        } else {
            logger.error(err.response.statusText, { message: "-from getPuuId" })
            await updateWrongSummonerId(summonerIds[key].summonerId)
            return
        }
    }
}
