const logger = require("../../log")
const {
    findVersion_matchId,
    deleteOutdatedData_matchId,
    findWrongMatchId,
    deleteWrongMatchId,
    deleteWrongPuuId,
    findWrongPuuId,
    findWrongSummonerId,
    deleteWrongSummonerId,
    deleteDoneMatchId,
    findDoneMatchId,
    getMainpageData_serviceDB,
} = require("./data.retirement.service")

exports.deleteOutdatedData = async (table) => {
    try {
        let findVersion, deleteOutdatedData, getMainPageData
        switch (table) {
            case "matchId":
                findVersion = findVersion_matchId
                deleteOutdatedData = deleteOutdatedData_matchId
                getMainPageData = getMainpageData_serviceDB
        }
        logger.info(`outdated한 패치버전 데이터 ${table}에서 제거 시작`)
        // 테이블에 존재하는 모든 패치버전 조회
        let originData = await findVersion()

        // 패치버전 최신순으로 sort 위해 소수 자리만 남기기
        let data = []
        for (const value of originData) {
            data.push(value.version)
        }

        data = data.filter((version) => {
            if (version[version.length - 1] === ".") {
                version = version.slice(0, -1)
            }
            if (!isNaN(Number(version))) {
                return version
            }
        })
        data = data.sort((a, b) => {
            return b.split(".")[0] - a.split(".")[0]
        })
        let recentVersions = []
        let lastVersions = []
        const recentVersion = Number(String(data[0]).split(".")[0])
        for (let i = 0; i < data.length; i++) {
            const version = data[i]
            if (Number(version.split(".")[0]) < recentVersion) {
                lastVersions.push(version)
            } else {
                recentVersions.push(version)
            }
        }
        recentVersions = recentVersions.sort((a, b) => {
            return String(b).split(".")[1] - String(a).split(".")[1]
        })
        lastVersions = lastVersions.sort((a, b) => {
            return String(b).split(".")[1] - String(a).split(".")[1]
        })
        recentVersions.push(...lastVersions)
        // 최신 3개 버전 제외하고 삭제하는 로직
        console.log(recentVersions)
        logger.info(`${table}에 남아있는 패치버전: ${recentVersions}`)
        const status = await getMainPageData(recentVersions[0])
        let startPoint
        // 최신 2개 버전 제외하고 삭제하는 로직
        if (status.category0 >= 30 && status.category1 >= 30 && status.category2 >= 30) {
            startPoint = 1
        } else {
            startPoint = 2
        }
        for (let i = startPoint; i < recentVersions.length; i++) {
            let version = recentVersions[i]
            await deleteOutdatedData(version)
            // console.log(`패치버전 ${version} 데이터 ${table}에서 제거 완료`)
        }
        logger.info(`outdated한 패치버전 ${table} 데이터 제거 완료`)
    } catch (err) {
        console.log(err)
    }
}

exports.deleteDoneMatchId = async () => {
    try {
        const data = await findDoneMatchId()
        console.log(data.length)
        await deleteDoneMatchId()
        logger.info(data.length, { message: `분석 완료한 matchId 제거 완료` })
    } catch (err) {}
}

exports.deleteWrongData = async (table) => {
    try {
        let findWrongData, deleteWrongData
        switch (table) {
            case "matchId":
                findWrongData = findWrongMatchId
                deleteWrongData = deleteWrongMatchId
                break
            case "puuId":
                findWrongData = findWrongPuuId
                deleteWrongData = deleteWrongPuuId
                break
            case "summonerId":
                findWrongData = findWrongSummonerId
                deleteWrongData = deleteWrongSummonerId
                break
        }
        const data = await findWrongData()
        logger.info(data.length, { message: `개: 분석 오류로 제거 시작한 ${table} 개수 ` })
        await deleteWrongData()
        logger.info(data.length, { message: `개: 분석 오류로 제거 완료한 ${table} 개수` })
        return
    } catch (err) {
        console.log(err)
        logger.error(err, { message: "-from WrongMatchId controller" })
    }
}
