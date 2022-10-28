const logger = require("../../log")
const { findVersion, deleteOutdatedData } = require("./data.retirement.service")


exports.deleteOutdataedData = async () => {
    try {
        logger.info('outdated한 패치버전 데이터 제거 시작')
        // 테이블에 존재하는 모든 패치버전 조회
        let originData = await findVersion()

        // 패치버전 최신순으로 sort 위해 소수 자리만 남기기
        let data = []
        for (const value of originData) {
            data.push(value.version)
        }

        data = data.filter((version) => {
            if (version[version.length - 1] === '.') {
                version = version.slice(0, -1)
            }
            if (!isNaN(Number(version))) {
                return version
            }
        })
        data = data.sort((a, b) => {
            return b.split('.')[0] - a.split('.')[0]
        })
        let recentVersions = []
        let lastVersions = []
        const recentVersion = Number(String(data[0]).split('.')[0])
        for (let i = 0; i < data.length; i++) {
            const version = data[i]
            if (Number(version.split('.')[0]) < recentVersion) {
                lastVersions.push(version)
            } else {
                recentVersions.push(version)
            }
        }
        recentVersions = recentVersions.sort((a, b) => {
            return String(b).split('.')[1] - String(a).split('.')[1]
        })
        lastVersions = lastVersions.sort((a, b) => {
            return String(b).split('.')[1] - String(a).split('.')[1]
        })
        recentVersions.push(...lastVersions)
        // 최신 3개 버전 제외하고 삭제하는 로직
        console.log(recentVersions)
        for (let i = 3; i < recentVersions.length; i++) {
            let version = recentVersions[i]
            // await deleteOutdatedData(version)
            console.log(`패치버전 ${version} 데이터 제거 완료`)
        }
        logger.info('outdated한 패치버전 데이터 제거 완료')
    } catch (err) {
        console.log(err)
    }
}