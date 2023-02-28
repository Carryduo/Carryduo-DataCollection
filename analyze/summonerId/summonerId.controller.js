const axios = require("axios")
const logger = require("../../log")
const { sleep } = require("../../timer/timer")
const { saveSummonerId } = require("./summonerId.service")
require("dotenv").config()

const fs = require("fs")

exports.summonerId = async () => {
    try {
        await startGetSummonerId()
        return "summonerId 분석 완료"
    } catch (err) {
        console.log(err)
    }
}

let errStatus = 0

async function startGetSummonerId() {
    let summonerIds = []
    let { page, standard } = await readOffset()

    const offset = {
        page,
        standard,
    }

    logger.info("summonerId 분석 시작")

    while (offset.page !== offset.standard) {
        console.log("while문 진입", "status: " + offset.page)
        await getSummonerId(summonerIds, offset)
    }

    if (offset.standard === 31) {
        offset.page = 1
        offset.standard = 6
    } else {
        offset.standard += 5 //6, 11, 16, 21, 26, 31
        errStatus = 0
    }
    await writeOffset(offset.page, offset.standard)

    logger.info(
        `summonerId 분석 완료, 다음 분석 첫페이지: ${offset.page}, 끝숫자: ${offset.standard}`
    )
    return "success"
}

async function getSummonerId(summonerIds, offset) {
    console.log("getSummonerId 실행")

    const tierList = ["DIAMOND", "PLATINUM"]
    const tierDivisionList = ["I", "II", "III", "IV"]
    for (let tier of tierList) {
        for (let division of tierDivisionList) {
            console.log(`${tier} ${division}, ${offset.page}` + "번째 페이지 요청")
            const targetTierUsersApiUrl = `https://kr.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${offset.page}&api_key=${process.env.KEY}`

            const response = await axios.get(targetTierUsersApiUrl).catch(async (err) => {
                if (err.response.status === 429) {
                    console.log("getSummonerId 라이엇 요청 제한 경고!")
                    console.log(err.response.statusText)
                    console.log(`${offset.page} 번째 페이지 요청 중에 오류`)
                    await sleep(125)
                    return (errStatus = 429)
                } else if (err.response.status === 403) {
                    logger.info("API키 갱신 필요 - summonerId 수집")
                    return
                } else {
                    console.log(err.response.status, err.response.statusText)
                    return
                }
            })

            if (errStatus !== 429) {
                const targetUsersData = response.data
                for (let value of targetUsersData) {
                    if (!summonerIds.includes(value.summonerId)) {
                        summonerIds.push(value.summonerId)
                        const data = await saveSummonerId(value.summonerId, tier, division)
                        if (data.code === 1062) {
                            console.log(offset.page + "번째 페이지 요청 중 중복값 발생")
                            continue
                        } else {
                            console.log(data)
                        }
                    }
                }
            } else {
                errStatus = 0
                offset.page -= 1
                continue
            }
        }
    }

    return offset.page++
}

async function readOffset() {
    const fileName = "offset.txt"
    const { page, standard } = JSON.parse(fs.readFileSync(fileName, { encoding: "utf-8" }))
    return { page, standard }
}

async function writeOffset(page, standard) {
    const fileName = "offset.txt"
    const data = JSON.stringify({ page, standard })
    fs.writeFileSync(fileName, data, { encoding: "utf-8" })
}

exports.testRiotRequest = async () => {
    const targetTierUsersApiUrl = `https://kr.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/DIAMOND/I?page=1&api_key=${process.env.KEY}`
    const response = await axios
        .get(targetTierUsersApiUrl)
        .then(() => {
            return true
        })
        .catch(async (err) => {
            if (err.response.status === 429) {
                console.log("getSummonerId 라이엇 요청 제한 경고!")
                console.log(err.response.statusText)
                await sleep(125)
                return false
            } else if (err.response.status === 403) {
                logger.info("API키 갱신 필요 - 라이엇 AccessKey 테스트")
                return false
            } else {
                logger.error(
                    `라이엇 AccessKey 테스트 에러: ${err.response.status}: ${err.response.statusText}`
                )
                return false
            }
        })
    return response
}
